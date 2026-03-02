import { useId, useState } from "react";
import type { ReactNode } from "react";
import { classNames } from "./classNames";
import "./Tooltip.css";

type TooltipPosition = "top" | "right" | "bottom" | "left";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
};

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="ui-tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span className="ui-tooltip__trigger" aria-describedby={visible ? tooltipId : undefined}>
        {children}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className={classNames(
          "ui-tooltip__content",
          `ui-tooltip__content--${position}`,
          visible && "ui-tooltip__content--visible",
        )}
      >
        {content}
        <span className={classNames("ui-tooltip__arrow", `ui-tooltip__arrow--${position}`)} />
      </span>
    </span>
  );
}
