import React from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeySwitch.css";

export interface VeySwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "value"
> {
  value: boolean;
  onChange?: (value: boolean) => void;
  activeText?: string;
  disabled?: boolean;
  glass?: VeyGlassValue;
}

export const VeySwitch: React.FC<VeySwitchProps> = ({
  value,
  onChange,
  activeText = "",
  disabled = false,
  glass,
  className = "",
  ...rest
}) => {
  const glassRef = useGlass<HTMLDivElement>(glass, "control");
  const toggle = () => {
    if (disabled) return;
    onChange?.(!value);
  };

  return (
    <button
      type="button"
      className={`vl-switch ${value ? "is-active" : ""} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      onClick={toggle}
      role="switch"
      aria-checked={value}
      disabled={disabled}
      {...rest}
    >
      <div className="vl-switch-track">
        <div ref={glassRef} className="vl-switch-handle" />
      </div>
      {activeText && <span className="vl-switch-label">{activeText}</span>}
    </button>
  );
};
