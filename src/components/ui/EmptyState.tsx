import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./classNames";
import "./EmptyState.css";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  cta,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div {...rest} className={classNames("ui-empty-state", className)}>
      {icon ? (
        <div className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3 className="ui-empty-state__title">{title}</h3>
      <p className="ui-empty-state__description">{description}</p>
      {cta ? <div className="ui-empty-state__cta">{cta}</div> : null}
    </div>
  );
}
