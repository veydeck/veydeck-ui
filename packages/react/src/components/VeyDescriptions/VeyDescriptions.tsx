import React from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyDescriptions.css";

export interface DescriptionItem {
  label: string;
  value?: React.ReactNode;
  slot?: string;
  span?: number;
  render?: (item: DescriptionItem, data?: any) => React.ReactNode;
}

export interface VeyDescriptionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 标题 */
  title?: string;
  /** 列表项配置 */
  items: DescriptionItem[];
  /** 原始数据对象 (用于插槽渲染) */
  data?: Record<string, any>;
  /** 列数 */
  column?: number;
  /** 是否显示边框 */
  border?: boolean;
  /** 插槽渲染器，对应 Vue 的 slot */
  slots?: Record<
    string,
    (item: DescriptionItem, data?: any) => React.ReactNode
  >;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeyDescriptions: React.FC<VeyDescriptionsProps> = ({
  title,
  items = [],
  data,
  column = 1,
  border = false,
  slots,
  glass,
  className = "",
  ...rest
}) => {
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  const renderContent = (item: DescriptionItem) => {
    if (item.render) {
      return item.render(item, data);
    }
    if (item.slot && slots && slots[item.slot]) {
      return slots[item.slot](item, data);
    }
    if (item.value !== undefined && item.value !== null) {
      return item.value;
    }
    if (data) {
      if (item.label && data[item.label] !== undefined) {
        const val = data[item.label];
        if (typeof val === "boolean") {
          return String(val);
        }
        return val as React.ReactNode;
      }
      if (item.slot && data[item.slot] !== undefined) {
        const val = data[item.slot];
        if (typeof val === "boolean") {
          return String(val);
        }
        return val as React.ReactNode;
      }
    }
    return "--";
  };

  return (
    <div
      className={`vl-descriptions ${border ? "is-border" : ""} ${className}`.trim()}
      {...rest}
    >
      {title && <div className="vl-descriptions-title">{title}</div>}
      <div
        ref={glassRef}
        className="vl-descriptions-grid"
        style={{ gridTemplateColumns: `repeat(${column}, 1fr)` }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="vl-descriptions-item"
            style={{ gridColumn: `span ${item.span || 1}` }}
          >
            <div className="vl-descriptions-label">{item.label}</div>
            <div className="vl-descriptions-content">{renderContent(item)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
