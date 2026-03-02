import { useEffect, useMemo, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { classNames } from "./classNames";
import "./Modal.css";

type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  isOpen: boolean;
  title?: string;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, details, [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  title,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  onClose,
  children,
  footer,
}: ModalProps) {
  const titleId = useMemo(() => `modal-title-${Math.random().toString(36).slice(2, 10)}`, []);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const hasFocusedOnOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      hasFocusedOnOpenRef.current = false;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!hasFocusedOnOpenRef.current) {
      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      focusable?.[0]?.focus();
      hasFocusedOnOpenRef.current = true;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (closeOnEscape && event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !contentRef.current) {
        return;
      }

      const nodes = Array.from(contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeOnEscape, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (!closeOnBackdropClick || event.target !== event.currentTarget) {
      return;
    }

    onClose();
  }

  return createPortal(
    <div className="ui-modal" onMouseDown={handleBackdropClick}>
      <div
        ref={contentRef}
        className={classNames("ui-modal__content", `ui-modal__content--${size}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <div className="ui-modal__header">
          {title ? (
            <h3 id={titleId} className="ui-modal__title">
              {title}
            </h3>
          ) : null}
          <button type="button" className="ui-modal__close" aria-label="Sluit venster" onClick={onClose}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
