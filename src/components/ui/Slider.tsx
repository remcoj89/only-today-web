import { useId, useMemo } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { classNames } from "./classNames";
import "./Slider.css";

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: string;
  helperText?: string;
  error?: string;
  showValue?: boolean;
};

export function Slider({
  id,
  label,
  helperText,
  error,
  className,
  required,
  min = 1,
  max = 10,
  step = 1,
  value,
  defaultValue,
  showValue = true,
  onChange,
  ...rest
}: SliderProps) {
  const generatedId = useId();
  const sliderId = id ?? `slider-${generatedId}`;
  const helpId = helperText ? `${sliderId}-help` : undefined;
  const errorId = error ? `${sliderId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  const currentValue = useMemo(() => {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      return Number(value);
    }
    if (typeof defaultValue === "number") {
      return defaultValue;
    }
    if (typeof defaultValue === "string") {
      return Number(defaultValue);
    }
    return Number(min);
  }, [defaultValue, min, value]);

  const progress =
    Number(max) > Number(min)
      ? ((Number(currentValue) - Number(min)) / (Number(max) - Number(min))) * 100
      : 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
  }

  return (
    <div className={classNames("ui-slider", error && "ui-slider--error", className)}>
      <div className="ui-slider__top-row">
        {label ? (
          <label className="ui-slider__label" htmlFor={sliderId}>
            {label}
          </label>
        ) : null}
        {showValue ? <span className="ui-slider__value">{currentValue}</span> : null}
      </div>
      <input
        {...rest}
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="ui-slider__field"
        style={{ "--ui-slider-progress": `${progress}%` } as React.CSSProperties}
        onChange={handleChange}
      />
      {helperText && !error ? (
        <p className="ui-slider__helper" id={helpId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="ui-slider__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
