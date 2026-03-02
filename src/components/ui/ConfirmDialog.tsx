import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import "./ConfirmDialog.css";

export type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Bevestigen",
  cancelLabel = "Annuleren",
  destructive = false,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm} loading={isConfirming}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="ui-confirm-dialog">
        <p className="ui-confirm-dialog__description">{description}</p>
      </div>
    </Modal>
  );
}
