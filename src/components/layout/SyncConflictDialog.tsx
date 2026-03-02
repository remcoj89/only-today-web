import { Button, Modal } from "@/components/ui";
import type { SyncConflict } from "@/hooks/useOfflineSync";
import "./SyncConflictDialog.css";

type SyncConflictDialogProps = {
  conflict: SyncConflict | null;
  submitting: boolean;
  onChooseLocal: () => Promise<void>;
  onChooseServer: () => Promise<void>;
};

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Onbekend";
  }
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(asDate);
}

function asPrettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function SyncConflictDialog({ conflict, submitting, onChooseLocal, onChooseServer }: SyncConflictDialogProps) {
  return (
    <Modal isOpen={Boolean(conflict)} onClose={() => {}} closeOnBackdropClick={false} closeOnEscape={false} title="Er was een sync conflict">
      {conflict ? (
        <div className="sync-conflict-dialog">
          <p>{conflict.message}</p>
          <p className="sync-conflict-dialog__target">
            Document: <strong>{conflict.docType}</strong> / <strong>{conflict.docKey}</strong>
          </p>
          <div className="sync-conflict-dialog__versions">
            <section className="sync-conflict-dialog__version">
              <h3>Mijn versie</h3>
              <p className="sync-conflict-dialog__timestamp">{formatTimestamp(conflict.localTimestamp)}</p>
              <pre>{asPrettyJson(conflict.localPayload)}</pre>
            </section>
            <section className="sync-conflict-dialog__version">
              <h3>Server versie</h3>
              <p className="sync-conflict-dialog__timestamp">{formatTimestamp(conflict.serverTimestamp)}</p>
              <pre>{asPrettyJson(conflict.serverPayload)}</pre>
            </section>
          </div>
          <div className="sync-conflict-dialog__actions">
            <Button variant="secondary" onClick={() => void onChooseServer()} loading={submitting}>
              Gebruik server versie
            </Button>
            <Button onClick={() => void onChooseLocal()} loading={submitting}>
              Gebruik mijn versie
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
