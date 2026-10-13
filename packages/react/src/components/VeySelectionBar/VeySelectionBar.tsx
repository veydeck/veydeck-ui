import React from "react";
import { VeyButton } from "../VeyButton/VeyButton";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeySelectionBar.css";

export interface VeySelectionBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "aria-label"
> {
  /** 已选择项目数量。 */
  count: number;
  /** 数量前的本地化说明，例如“已选择”。 */
  label: string;
  /** 清除选择按钮文案；不传时隐藏按钮。 */
  clearLabel?: string;
  /** 是否禁止清除选择。 */
  clearDisabled?: boolean;
  /** 选择摘要的无障碍名称。 */
  ariaLabel?: string;
  /** 清除选择回调。 */
  onClear?: () => void;
  /** 批量操作。 */
  children?: React.ReactNode;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeySelectionBar: React.FC<VeySelectionBarProps> = ({
  count,
  label,
  clearLabel,
  clearDisabled = false,
  ariaLabel,
  onClear,
  children,
  glass,
  className = "",
  ...rest
}) => {
  const glassRef = useGlass<HTMLDivElement>(glass, "control");
  return (
    <div
      ref={glassRef}
      className={`vl-selection-bar ${className}`.trim()}
      {...rest}
      data-ui="selection-bar"
    >
      <div
        className="vl-selection-summary"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={ariaLabel}
        data-slot="selection-summary"
      >
        <span className="vl-selection-label">{label}</span>
        <span className="vl-selection-count">{count}</span>
      </div>
      <div className="vl-selection-actions" data-slot="selection-actions">
        {children}
        {clearLabel && (
          <VeyButton
            glass={glass}
            disabled={clearDisabled}
            data-ui="clear-selection"
            onClick={onClear}
          >
            {clearLabel}
          </VeyButton>
        )}
      </div>
    </div>
  );
};
