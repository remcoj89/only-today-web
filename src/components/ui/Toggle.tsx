import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "./classNames";
import "./Toggle.css";

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label: ReactNode;
  helperText?: string;
  error?: string;
};

export function Toggle({ id, label, helperText, error, className, required, ...rest }: ToggleProps) {
  const generatedId = useId();
  const toggleId = id ?? `toggle-${generatedId}`;
  const helpId = helperText ? `${toggleId}-help` : undefined;
  const errorId = error ? `${toggleId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={classNames("ui-toggle", error && "ui-toggle--error", className)}>
      <label className="ui-toggle__label" htmlFor={toggleId}>
        <input
          {...rest}
          id={toggleId}
          type="checkbox"
          role="switch"
          className="ui-toggle__input"
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <span className="ui-toggle__track" aria-hidden="true">
          <span className="ui-toggle__thumb" />
        </span>
        <span className="ui-toggle__text">{label}</span>
      </label>
      {helperText && !error ? (
        <p className="ui-toggle__helper" id={helpId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="ui-toggle__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
