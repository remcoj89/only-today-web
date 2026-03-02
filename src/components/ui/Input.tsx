import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "./classNames";
import "./Input.css";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Input({
  id,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  required,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;
  const helpId = helperText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={classNames("ui-input", error && "ui-input--error", className)}>
      {label ? (
        <label className="ui-input__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className="ui-input__control">
        {leftIcon ? (
          <span className="ui-input__icon ui-input__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        <input
          {...rest}
          id={inputId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={classNames(
            "ui-input__field",
            leftIcon && "ui-input__field--with-left-icon",
            rightIcon && "ui-input__field--with-right-icon",
          )}
        />
        {rightIcon ? (
          <span className="ui-input__icon ui-input__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </div>
      {helperText && !error ? (
        <p className="ui-input__helper" id={helpId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="ui-input__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
