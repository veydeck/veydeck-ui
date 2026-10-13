import React from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyCard.css";

export interface VeyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 阴影显示时机 */
  shadow?: "always" | "hover" | "never";
  /** 内容区自定义样式 */
  contentStyle?: React.CSSProperties;
  /** 默认插槽容器语义 */
  contentRole?: "content" | "header";
  /** 内容区是否撑满高度 (用于包含滚动表格的场景) */
  fullHeight?: boolean;
  /** 头部内容 */
  header?: React.ReactNode;
  /** 子元素，卡片内容 */
  children?: React.ReactNode;
  glass?: VeyGlassValue;
}

export const VeyCard: React.FC<VeyCardProps> = ({
  shadow = "always",
  contentStyle,
  contentRole = "content",
  fullHeight = false,
  header,
  className = "",
  children,
  glass,
  ...rest
}) => {
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  return (
    <div
      ref={glassRef}
      className={`vl-card is-shadow-${shadow} ${
        fullHeight ? "is-full-height" : ""
      } ${className}`.trim()}
      {...rest}
    >
      {header && <div className="vl-card-header">{header}</div>}
      <div
        className={`${
          contentRole === "header" ? "vl-card-header" : "vl-card-content"
        } ${fullHeight ? "is-full-height" : ""}`.trim()}
        style={contentStyle}
      >
        {children}
      </div>
    </div>
  );
};
