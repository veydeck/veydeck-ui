import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { activateModalLifecycle } from "../../internal/modal-lifecycle";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyDrawer.css";

export interface VeyDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 抽屉是否显示 */
  visible: boolean;
  /** 抽屉标题 */
  title?: string;
  /** 自定义宽度，支持 px 或百分比，默认值为 420px */
  width?: string;
  /** 点击遮罩层是否允许自动关闭抽屉，默认为 true */
  closeOnOverlay?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 底部操作按钮栏 */
  footer?: React.ReactNode;
  /** 抽屉主体内容 */
  children?: React.ReactNode;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeyDrawer: React.FC<VeyDrawerProps> = ({
  visible,
  title = "",
  width = "420px",
  closeOnOverlay = true,
  onClose,
  footer,
  className = "",
  style,
  children,
  glass,
  ...rest
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  const titleId = useId();
  useEffect(() => {
    if (!visible || !panelRef.current) return;
    return activateModalLifecycle(panelRef.current, () => onClose?.());
  }, [visible, onClose]);
  if (!visible) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const drawerStyle: React.CSSProperties = {
    width,
    ...style,
  };

  return createPortal(
    <div
      className={`vl-drawer-overlay ${className}`.trim()}
      onClick={handleOverlayClick}
      role="presentation"
      {...rest}
    >
      <div
        ref={(node) => {
          panelRef.current = node;
          glassRef(node);
        }}
        className="vl-drawer-panel"
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* 头部标题栏 */}
        <div className="vl-drawer-header" data-slot="header">
          <h3 id={titleId} className="vl-drawer-title">
            {title}
          </h3>
          <button
            type="button"
            className="vl-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        {/* 主体内容区 */}
        <div className="vl-drawer-body">{children}</div>

        {/* 底部操作按钮栏 */}
        {footer && (
          <div className="vl-drawer-footer" data-slot="footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
