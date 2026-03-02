import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "./classNames";
import "./Checkbox.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label: ReactNode;
  helperText?: string;
  error?: string;
};

export function Checkbox({ id, label, helperText, error, className, required, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? `checkbox-${generatedId}`;
  const helpId = helperText ? `${checkboxId}-help` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={classNames("ui-checkbox", error && "ui-checkbox--error", className)}>
      <label className="ui-checkbox__label" htmlFor={checkboxId}>
        <input
          {...rest}
          id={checkboxId}
          type="checkbox"
          className="ui-checkbox__input"
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <span className="ui-checkbox__box" aria-hidden="true" />
        <span className="ui-checkbox__text">{label}</span>
      </label>
      {helperText && !error ? (
        <p className="ui-checkbox__helper" id={helpId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="ui-checkbox__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
