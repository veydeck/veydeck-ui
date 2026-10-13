import React, { useId } from "react";
import "./VeyFormItem.css";

export interface VeyFormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 标签文本 */
  label?: string;
  /** 是否必填 (显示红星) */
  required?: boolean;
  /** 提示文本 */
  hint?: string;
  htmlFor?: string;
  error?: string;
  labelId?: string;
  hintId?: string;
  errorId?: string;
}

export const VeyFormItem: React.FC<VeyFormItemProps> = ({
  label,
  required = false,
  hint,
  htmlFor,
  error,
  labelId,
  hintId,
  errorId,
  className = "",
  children,
  ...rest
}) => {
  const generatedId = useId();
  const resolvedLabelId = labelId ?? `${generatedId}-label`;
  const resolvedHintId = hintId ?? `${generatedId}-hint`;
  const resolvedErrorId = errorId ?? `${generatedId}-error`;

  return (
    <div className={`vl-form-item ${className}`.trim()} {...rest}>
      {label && (
        <label
          id={resolvedLabelId}
          className="vl-form-item-label"
          htmlFor={htmlFor}
        >
          {required && <span className="vl-form-item-required">*</span>}
          {label}
        </label>
      )}
      <div className="vl-form-item-content">
        {children}
        {hint && (
          <div id={resolvedHintId} className="vl-form-item-hint">
            {hint}
          </div>
        )}
        {error && (
          <div id={resolvedErrorId} className="vl-form-item-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
