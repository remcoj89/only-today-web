import { useId, useMemo, useRef } from "react";
import type { ChangeEvent, TextareaHTMLAttributes } from "react";
import { classNames } from "./classNames";
import "./Textarea.css";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  showCharacterCount?: boolean;
};

export function Textarea({
  id,
  label,
  error,
  helperText,
  required,
  className,
  autoResize = false,
  showCharacterCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textAreaId = id ?? `textarea-${generatedId}`;
  const helpId = helperText ? `${textAreaId}-help` : undefined;
  const errorId = error ? `${textAreaId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentLength = useMemo(() => {
    if (typeof value === "string") {
      return value.length;
    }
    if (typeof defaultValue === "string") {
      return defaultValue.length;
    }
    return 0;
  }, [defaultValue, value]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (autoResize && textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }

    onChange?.(event);
  }

  return (
    <div className={classNames("ui-textarea", error && "ui-textarea--error", className)}>
      {label ? (
        <label className="ui-textarea__label" htmlFor={textAreaId}>
          {label}
        </label>
      ) : null}
      <textarea
        {...rest}
        ref={textAreaRef}
        id={textAreaId}
        required={required}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="ui-textarea__field"
        onChange={handleChange}
      />
      <div className="ui-textarea__meta">
        {helperText && !error ? (
          <p className="ui-textarea__helper" id={helpId}>
            {helperText}
          </p>
        ) : (
          <span />
        )}
        {showCharacterCount && maxLength ? (
          <p className="ui-textarea__counter" aria-live="polite">
            {currentLength}/{maxLength}
          </p>
        ) : null}
      </div>
      {error ? (
        <p className="ui-textarea__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
