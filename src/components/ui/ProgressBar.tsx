import type { HTMLAttributes } from "react";
import { classNames } from "./classNames";
import "./ProgressBar.css";

type ProgressVariant = "accent" | "success";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  showValue?: boolean;
};

export function ProgressBar({
  value,
  max = 100,
  variant = "accent",
  showValue = false,
  className,
  ...rest
}: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? Math.round((safeValue / max) * 100) : 0;

  return (
    <div className={classNames("ui-progress", className)} {...rest}>
      <div
        className="ui-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safeValue}
      >
        <div
          className={classNames("ui-progress__fill", `ui-progress__fill--${variant}`)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue ? <span className="ui-progress__label">{percentage}%</span> : null}
    </div>
  );
}
