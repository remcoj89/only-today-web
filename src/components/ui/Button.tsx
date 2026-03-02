import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";
import { classNames } from "./classNames";
import type { UISize } from "./types";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
  variant?: ButtonVariant;
  size?: UISize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  children,
  type = "button",
  onClick,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      className={classNames(
        "ui-button",
        `ui-button--${variant}`,
        `ui-button--${size}`,
        fullWidth && "ui-button--full-width",
        loading && "ui-button--loading",
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (isDisabled) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
    >
      {loading ? (
        <span className="ui-button__spinner" aria-hidden="true">
          <Spinner size="sm" />
        </span>
      ) : null}
      {leftIcon && !loading ? (
        <span className="ui-button__icon ui-button__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span className="ui-button__label">{children}</span>
      {rightIcon && !loading ? (
        <span className="ui-button__icon ui-button__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}
