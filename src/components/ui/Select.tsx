import { useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { classNames } from "./classNames";
import "./Select.css";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
};

export function Select({
  id,
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  required,
  children,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  const helpId = helperText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={classNames("ui-select", error && "ui-select--error", className)}>
      {label ? (
        <label className="ui-select__label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className="ui-select__control">
        <select
          {...rest}
          id={selectId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="ui-select__field"
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown className="ui-select__icon" size={16} strokeWidth={1.75} aria-hidden="true" />
      </div>
      {helperText && !error ? (
        <p className="ui-select__helper" id={helpId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="ui-select__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
