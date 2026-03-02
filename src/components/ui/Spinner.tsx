import type { HTMLAttributes } from "react";
import { classNames } from "./classNames";
import type { UISize } from "./types";
import "./Spinner.css";

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: UISize;
  label?: string;
};

export function Spinner({ size = "md", label = "Laden", className, ...rest }: SpinnerProps) {
  return (
    <span
      {...rest}
      className={classNames("ui-spinner", `ui-spinner--${size}`, className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="ui-spinner__ring" />
    </span>
  );
}
