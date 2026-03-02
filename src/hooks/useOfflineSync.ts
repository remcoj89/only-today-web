import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ApiError, apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { OFFLINE_SYNC } from "@/lib/constants";
import { apiContentToDayPayload, dayPayloadToApiContent, periodPayloadToApiContent } from "@/lib/dayPayloadToApi";
import {
  dispatchDocumentChanged,
  getSyncQueue,
  incrementRetry,
  removeSyncQueueItem,
  removeSyncQueueItemsByDoc,
  saveDocument,
  type SyncQueueItem,
} from "@/lib/offline";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";
export type SyncConflictChoice = "use_local" | "use_server";

export type SyncConflict = {
  docType: string;
  docKey: string;
  localPayload: unknown;
  localTimestamp: string;
  serverPayload: unknown;
  serverTimestamp: string | null;
  message: string;
};

type UseOfflineSyncOptions = {
  autoStart?: boolean;
};

type DocumentConflictResolution = {
  winner: "incoming" | "existing";
  document?: {
    content?: unknown;
    clientUpdatedAt?: string;
    client_updated_at?: string;
    serverReceivedAt?: string;
    server_received_at?: string;
  };
};

type DocumentUpsertResponse = {
  document?: unknown;
  conflictResolution?: DocumentConflictResolution;
};

type QueueProcessResult =
  | { kind: "success" }
  | {
      kind: "conflict";
      serverPayload: unknown;
      serverTimestamp: string | null;
      message: string;
    }
  | { kind: "failed"; message?: string };

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function emitSyncStatus(status: SyncStatus): void {
  window.dispatchEvent(
    new CustomEvent("onlytoday:sync-status", {
      detail: { status },
    }),
  );
}

function extractConflictFromError(error: ApiError, fallbackPayload: unknown): QueueProcessResult | null {
  if (!error.code.toLowerCase().includes("conflict")) {
    return null;
  }

  const details = error.details ?? {};
  const serverPayload =
    details.serverPayload ??
    details.serverDocument ??
    details.existingDocument ??
    details.document ??
    details.current ??
    fallbackPayload;
  const serverTimestamp = (() => {
    const raw =
      details.serverTimestamp ??
      details.serverReceivedAt ??
      details.server_received_at ??
      details.clientUpdatedAt ??
      details.client_updated_at;
    return typeof raw === "string" ? raw : null;
  })();

  return {
    kind: "conflict",
    serverPayload,
    serverTimestamp,
    message: error.message || "Er was een sync conflict.",
  };
}

async function processQueueItem(item: SyncQueueItem, clientUpdatedAtOverride?: string): Promise<QueueProcessResult> {
  const endpoint = `/documents/${item.docType}/${item.docKey}`;
  const method = item.operation === "delete" ? "DELETE" : "PUT";
  const content =
    item.operation === "delete"
      ? undefined
      : item.docType === "day"
        ? dayPayloadToApiContent(item.payload)
        : periodPayloadToApiContent(item.docType, item.payload);
  const payload = item.payload as Record<string, unknown> | undefined;
  const status = item.docType === "day" && payload?.status ? payload.status : undefined;
  const body =
    item.operation === "delete"
      ? undefined
      : JSON.stringify({
          content,
          clientUpdatedAt: clientUpdatedAtOverride ?? item.createdAt ?? new Date().toISOString(),
          deviceId: "web",
          ...(status && { status }),
        });

  const result = await apiFetch<DocumentUpsertResponse>(endpoint, {
    method,
    body,
  });

  if (!result.success) {
    const conflict = extractConflictFromError(result, item.payload);
    if (conflict) {
      return conflict;
    }
    return { kind: "failed", message: result.message };
  }

  if (item.operation === "delete") {
    return { kind: "success" };
  }

  const conflict = result.data.conflictResolution;
  if (conflict?.winner === "existing") {
    return {
      kind: "conflict",
      serverPayload: conflict.document?.content ?? item.payload,
      serverTimestamp:
        conflict.document?.clientUpdatedAt ??
        conflict.document?.client_updated_at ??
        conflict.document?.serverReceivedAt ??
        conflict.document?.server_received_at ??
        null,
      message: "Er was een sync conflict.",
    };
  }

  return { kind: "success" };
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const { autoStart = true } = options;
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isOnline ? "synced" : "offline");
  const [pendingConflict, setPendingConflict] = useState<SyncConflict | null>(null);
  const runningRef = useRef(false);
  const conflictItemRef = useRef<SyncQueueItem | null>(null);

  const setStatus = useCallback((status: SyncStatus) => {
    setSyncStatus(status);
    emitSyncStatus(status);
  }, []);

  const processQueue = useCallback(async () => {
    if (runningRef.current) {
      return;
    }
    const hasToken = !!getAccessToken();
    if (!hasToken) {
      // Auth pages mount global providers too; skip sync work without a session.
      setStatus("synced");
      return;
    }
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }

    runningRef.current = true;
    setStatus("syncing");

    try {
      const fullQueue = await getSyncQueue();
      // Deduplicate: per (docType, docKey) keep only the item with the latest createdAt.
      // This avoids conflicts when e.g. an old partial save is processed before a newer close.
      const byKey = new Map<string, SyncQueueItem>();
      for (const item of fullQueue) {
        if (!item.id) continue;
        const key = `${item.docType}:${item.docKey}`;
        const existing = byKey.get(key);
        if (!existing || item.createdAt > existing.createdAt) {
          byKey.set(key, item);
        }
      }
      const queue = Array.from(byKey.values());

      for (const item of queue) {
        if (!item.id) {
          continue;
        }
        const result = await processQueueItem(item);
        if (result.kind === "success") {
          await removeSyncQueueItemsByDoc(item.docType, item.docKey);
        } else if (result.kind === "failed") {
          if (import.meta.env.DEV) {
            console.error("[useOfflineSync] Item failed:", item.docType, item.docKey, result.message, item);
          }
          if (item.retries + 1 >= OFFLINE_SYNC.maxRetries) {
            setStatus("error");
            continue;
          }
          await incrementRetry(item.id);
          const backoff = OFFLINE_SYNC.baseBackoffMs * 2 ** item.retries;
          await wait(backoff);
        } else if (result.kind === "conflict") {
          conflictItemRef.current = item;
          setPendingConflict({
            docType: item.docType,
            docKey: item.docKey,
            localPayload: item.payload,
            localTimestamp: item.createdAt,
            serverPayload: result.serverPayload,
            serverTimestamp: result.serverTimestamp,
            message: result.message,
          });
          setStatus("error");
          return;
        }
      }

      const remaining = await getSyncQueue();
      setStatus(remaining.length > 0 ? "error" : "synced");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[useOfflineSync] Sync failed:", err);
      }
      setStatus("error");
    } finally {
      runningRef.current = false;
    }
  }, [setStatus]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void processQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [processQueue, setStatus]);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    const heartbeatId = window.setInterval(() => {
      setIsOnline(navigator.onLine);
    }, OFFLINE_SYNC.heartbeatMs);

    const intervalId = window.setInterval(() => {
      if (navigator.onLine) {
        void processQueue();
      }
    }, OFFLINE_SYNC.intervalMs);

    if (navigator.onLine) {
      void processQueue();
    }

    return () => {
      window.clearInterval(heartbeatId);
      window.clearInterval(intervalId);
    };
  }, [autoStart, processQueue]);

  const resolveConflict = useCallback(
    async (choice: SyncConflictChoice) => {
      const queueItem = conflictItemRef.current;
      const conflict = pendingConflict;
      if (!queueItem || !queueItem.id || !conflict) {
        return false;
      }

      if (choice === "use_server") {
        const payloadToStore =
          queueItem.docType === "day"
            ? apiContentToDayPayload(conflict.serverPayload, queueItem.docKey)
            : conflict.serverPayload;
        await saveDocument({
          docType: queueItem.docType,
          docKey: queueItem.docKey,
          payload: payloadToStore,
        });
        await removeSyncQueueItemsByDoc(queueItem.docType, queueItem.docKey);
        dispatchDocumentChanged(queueItem.docType, queueItem.docKey);
        conflictItemRef.current = null;
        setPendingConflict(null);
        await processQueue();
        return true;
      }

      const retryResult = await processQueueItem(queueItem, new Date().toISOString());
      if (retryResult.kind === "success") {
        await removeSyncQueueItemsByDoc(queueItem.docType, queueItem.docKey);
        conflictItemRef.current = null;
        setPendingConflict(null);
        await processQueue();
        return true;
      }

      if (retryResult.kind === "conflict") {
        setPendingConflict({
          docType: queueItem.docType,
          docKey: queueItem.docKey,
          localPayload: queueItem.payload,
          localTimestamp: queueItem.createdAt,
          serverPayload: retryResult.serverPayload,
          serverTimestamp: retryResult.serverTimestamp,
          message: retryResult.message,
        });
      } else {
        setStatus("error");
      }

      return false;
    },
    [pendingConflict, processQueue, setStatus],
  );

  return useMemo(
    () => ({
      isOnline,
      syncStatus,
      processQueue,
      enqueueWhenOffline: !isOnline,
      pendingConflict,
      resolveConflict,
    }),
    [isOnline, pendingConflict, processQueue, resolveConflict, syncStatus],
  );
}
