import { useEffect } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { classNames } from "./classNames";
import "./Toast.css";

type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastProps = {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  action?: ReactNode;
};

export type ToastListProps = {
  toasts: ToastProps[];
  onClose?: (id?: string) => void;
};

export function Toast({
  title,
  message,
  variant = "info",
  duration = 5000,
  onClose,
  action,
}: ToastProps) {
  useEffect(() => {
    if (!onClose || duration <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, onClose]);

  return (
    <article className={classNames("ui-toast", `ui-toast--${variant}`)} aria-live="polite">
      <div className="ui-toast__content">
        {title ? <p className="ui-toast__title">{title}</p> : null}
        <p className="ui-toast__message">{message}</p>
      </div>
      {action ? <div className="ui-toast__action">{action}</div> : null}
      <button
        type="button"
        className="ui-toast__close"
        onClick={onClose}
        aria-label="Sluit melding"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </article>
  );
}

export function ToastStack({ toasts, onClose }: ToastListProps) {
  return (
    <div className="ui-toast-stack" role="region" aria-label="Meldingen">
      {toasts.map((toast, index) => (
        <div key={toast.id ?? `${toast.message}-${index}`} className="ui-toast-stack__item">
          <Toast {...toast} onClose={() => onClose?.(toast.id)} />
        </div>
      ))}
    </div>
  );
}

export type ToastCloseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function ToastCloseButton({ className, ...rest }: ToastCloseButtonProps) {
  return (
    <button
      {...rest}
      type={rest.type ?? "button"}
      className={classNames("ui-toast-close-button", className)}
    />
  );
}
