import type { HTMLAttributes } from "react";
import { classNames } from "./classNames";
import type { UIStatus } from "./types";
import "./Badge.css";

type BadgeVariant = Exclude<UIStatus, "default">;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "neutral", className, ...rest }: BadgeProps) {
  return <span {...rest} className={classNames("ui-badge", `ui-badge--${variant}`, className)} />;
}
