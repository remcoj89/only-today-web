import { useCallback, useEffect, useState } from "react";
import { getDocument, saveDocument as saveDocumentToOffline } from "@/lib/offline";

const DOCUMENT_CHANGED = "onlytoday:document-changed";

type StoredDocument = {
  docType: string;
  docKey: string;
  payload: unknown;
  updatedAt?: string;
};

export function useDocument(
  docType: string,
  docKey: string,
): {
  document: StoredDocument | null;
  loading: boolean;
  saveDocument: (payload: unknown) => Promise<void>;
} {
  const [document, setDocument] = useState<StoredDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const doc = await getDocument(docType, docKey);
      setDocument(doc ?? null);
    } finally {
      setLoading(false);
    }
  }, [docType, docKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ docType: string; docKey: string }>).detail;
      if (detail?.docType === docType && detail?.docKey === docKey) {
        void load();
      }
    };
    window.addEventListener(DOCUMENT_CHANGED, handler);
    return () => window.removeEventListener(DOCUMENT_CHANGED, handler);
  }, [docType, docKey, load]);

  const saveDocument = useCallback(
    async (payload: unknown) => {
      await saveDocumentToOffline({ docType, docKey, payload });
    },
    [docType, docKey],
  );

  return {
    document: document ?? null,
    loading,
    saveDocument,
  };
}
