import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/components/ui";
import "./PageTransition.css";

type PageTransitionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function PageTransition({ children, className, ...rest }: PageTransitionProps) {
  return (
    <div {...rest} className={classNames("page-transition", className)}>
      {children}
    </div>
  );
}
