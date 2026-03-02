import Dexie, { type EntityTable } from "dexie";

export type StoredDocument = {
  docType: string;
  docKey: string;
  payload: unknown;
  updatedAt?: string;
};

export type SyncQueueItem = {
  id?: number;
  docType: string;
  docKey: string;
  payload: unknown;
  createdAt: string;
  retries: number;
  operation: "upsert" | "delete";
};

class OfflineDatabase extends Dexie {
  documents!: EntityTable<StoredDocument, [string, string]>;
  syncQueue!: EntityTable<SyncQueueItem, number>;

  constructor() {
    super("OnlyTodayOffline");
    this.version(1).stores({
      documents: "[docType+docKey]",
      syncQueue: "++id, [docType+docKey], createdAt, retries",
    });
  }
}

export const offlineDb = new OfflineDatabase();

const DOCUMENT_CHANGED = "onlytoday:document-changed";

export function dispatchDocumentChanged(docType: string, docKey: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(DOCUMENT_CHANGED, { detail: { docType, docKey } }),
    );
  }
}

export async function saveDocument(args: {
  docType: string;
  docKey: string;
  payload: unknown;
}): Promise<void> {
  const { docType, docKey, payload } = args;
  const updatedAt = new Date().toISOString();
  await offlineDb.documents.put({
    docType,
    docKey,
    payload,
    updatedAt,
  });
  await addSyncQueueItem({
    docType,
    docKey,
    payload,
    createdAt: updatedAt,
    retries: 0,
    operation: "upsert",
  });
  // Don't dispatch here: it would trigger useDocument to reload and show a loading spinner
  // on every keystroke/checkbox. useOfflineSync calls dispatchDocumentChanged explicitly
  // after conflict resolution when the UI needs to refresh.
}

export async function getDocument(
  docType: string,
  docKey: string,
): Promise<StoredDocument | undefined> {
  return offlineDb.documents.get([docType, docKey]);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return offlineDb.syncQueue.orderBy("createdAt").toArray();
}

export async function addSyncQueueItem(item: Omit<SyncQueueItem, "id">): Promise<number> {
  return offlineDb.syncQueue.add({
    ...item,
    retries: item.retries ?? 0,
    operation: item.operation ?? "upsert",
  });
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  await offlineDb.syncQueue.delete(id);
}

export async function removeSyncQueueItemsByDoc(
  docType: string,
  docKey: string,
): Promise<void> {
  await offlineDb.syncQueue.where("[docType+docKey]").equals([docType, docKey]).delete();
}


export async function incrementRetry(id: number): Promise<void> {
  const item = await offlineDb.syncQueue.get(id);
  if (item) {
    await offlineDb.syncQueue.update(id, { retries: (item.retries ?? 0) + 1 });
  }
}
