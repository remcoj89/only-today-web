import type { HTMLAttributes } from "react";
import { classNames } from "./classNames";
import "./Card.css";

type CardVariant = "default" | "elevated" | "accent";

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section";
  variant?: CardVariant;
};

export function Card({ as = "div", variant = "default", className, ...rest }: CardProps) {
  const Component = as;
  return <Component {...rest} className={classNames("ui-card", `ui-card--${variant}`, className)} />;
}
