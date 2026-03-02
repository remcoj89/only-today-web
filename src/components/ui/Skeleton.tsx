import type { HTMLAttributes } from "react";
import { classNames } from "./classNames";
import type { UISize } from "./types";
import "./Skeleton.css";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  size?: UISize;
};

export function Skeleton({ className, lines = 1, size = "md", ...rest }: SkeletonProps) {
  return (
    <div
      {...rest}
      className={classNames("ui-skeleton", `ui-skeleton--${size}`, className)}
      role="status"
      aria-live="polite"
      aria-label="Laden"
    >
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <span key={index} className="ui-skeleton__line" />
      ))}
    </div>
  );
}
