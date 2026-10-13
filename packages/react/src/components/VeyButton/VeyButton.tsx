import React from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyButton.css";

export interface VeyButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  type?: "primary" | "secondary" | "danger" | "warning" | "info";
  size?: "small" | "default" | "large";
  disabled?: boolean;
  loading?: boolean;
  glass?: VeyGlassValue;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export const VeyButton: React.FC<VeyButtonProps> = ({
  type = "secondary",
  size = "default",
  disabled = false,
  loading = false,
  glass,
  onClick,
  className = "",
  children,
  ...rest
}) => {
  const glassRef = useGlass<HTMLButtonElement>(glass, "control");
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(event);
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={glassRef}
      className={`vl-button vl-button--${type} vl-button--${size} ${loading ? "is-loading" : ""} ${className}`.trim()}
      disabled={isDisabled}
      type="button"
      onClick={handleClick}
      {...rest}
    >
      {loading && (
        <span className="vl-button-loading-icon">
          <svg className="vl-spinner" viewBox="0 0 50 50">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            />
          </svg>
        </span>
      )}
      <span className="vl-button-content">{children}</span>
    </button>
  );
};
