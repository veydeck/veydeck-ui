import React, { useId, useState } from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import { VeyIcon } from "../VeyIcon/VeyIcon";
import "./VeyInput.css";

export interface VeyInputProps<
  T extends string | number | null = string,
> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "value"
  | "onChange"
  | "onFocus"
  | "onBlur"
  | "id"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
> {
  /** 绑定值 */
  value: T;
  /** 输入类型 */
  type?: "text" | "password" | "textarea" | "number" | "datetime-local";
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 最大长度 */
  maxLength?: number;
  /** 行数 (仅 textarea 有效) */
  rows?: number;
  /** 是否显示密码切换按钮 */
  showPassword?: boolean;
  /** 最小值 (仅 number 有效) */
  min?: number | string;
  /** 最大值 (仅 number 有效) */
  max?: number | string;
  /** 步长 (仅 number 有效) */
  step?: number | string;
  /** 自动填充属性 */
  autoComplete?: string;
  /** 值改变事件 */
  onChange?: (value: T) => void;
  invalid?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  glass?: VeyGlassValue;
  /** focus 事件 */
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** blur 事件 */
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export function VeyInput<T extends string | number | null = string>({
  value,
  type = "text",
  placeholder,
  disabled = false,
  readOnly,
  maxLength,
  rows = 3,
  showPassword = false,
  min,
  max,
  step,
  autoComplete,
  onChange,
  onFocus,
  onBlur,
  invalid = false,
  id,
  name,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  glass,
  className = "",
  ...rest
}: VeyInputProps<T>) {
  const glassRef = useGlass<HTMLDivElement | HTMLTextAreaElement>(
    glass,
    "input",
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const generatedId = useId();
  const resolvedId = id ?? generatedId;

  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextValue = (
      type === "number"
        ? event.target.value === ""
          ? null
          : Number(event.target.value)
        : event.target.value
    ) as T;
    onChange?.(nextValue);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const inputType = type === "password" && isPasswordVisible ? "text" : type;

  const displayValue =
    value === null || value === undefined ? "" : String(value);

  return (
    <div
      className={`vl-input-wrapper is-${type} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      {...rest}
    >
      {type === "textarea" ? (
        <textarea
          ref={glassRef}
          className="vl-textarea"
          id={resolvedId}
          name={name}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          rows={rows}
          onChange={handleInput}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
        />
      ) : (
        <div ref={glassRef} className="vl-input-inner-wrapper">
          <input
            className="vl-input"
            id={resolvedId}
            name={name}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            type={inputType}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            onChange={handleInput}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-invalid={invalid || undefined}
          />
          {showPassword && type === "password" && (
            <button
              type="button"
              className="vl-input-password-toggle"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-pressed={isPasswordVisible}
            >
              <VeyIcon
                name={isPasswordVisible ? "eye-off" : "lock"}
                size={16}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
