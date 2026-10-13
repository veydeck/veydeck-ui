import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { activateModalLifecycle } from "../../internal/modal-lifecycle";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyDialog.css";

export interface VeyDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 对话框是否显示 */
  visible: boolean;
  /** 对话框标题 */
  title: string;
  /** 自定义宽度，支持 px 或百分比，默认值为 500px */
  width?: string;
  /** 点击遮罩层是否允许自动关闭对话框，默认为 true */
  closeOnClickOverlay?: boolean;
  /** 对话框遮罩层级，默认使用 VDL modal 层级 */
  zIndex?: number | string;
  /** 关闭回调 */
  onClose?: () => void;
  /** 底部渲染插槽 */
  footer?: React.ReactNode;
  /** 对话框内容 */
  children?: React.ReactNode;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeyDialog: React.FC<VeyDialogProps> = ({
  visible,
  title,
  width = "500px",
  closeOnClickOverlay = true,
  zIndex = "var(--vdl-z-index-modal)",
  onClose,
  footer,
  className = "",
  style,
  children,
  glass,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  const titleId = useId();
  useEffect(() => {
    if (!visible || !cardRef.current) return;
    return activateModalLifecycle(cardRef.current, () => onClose?.());
  }, [visible, onClose]);
  if (!visible) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOverlay && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const overlayStyle: React.CSSProperties = {
    zIndex: zIndex as any,
    ...style,
  };

  return createPortal(
    <div
      className={`vl-dialog-overlay ${className}`.trim()}
      style={overlayStyle}
      onClick={handleOverlayClick}
      role="presentation"
      {...rest}
    >
      <div
        ref={cardRef}
        className="vl-dialog-card"
        style={{ width, maxWidth: "95%" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div
          ref={glassRef}
          className="vl-dialog-glass-layer"
          aria-hidden="true"
          data-slot="glass-layer"
        />

        {/* 头部标题栏 */}
        <div className="vl-dialog-header" data-slot="header">
          <span id={titleId} className="vl-dialog-title">
            {title}
          </span>
          <button
            type="button"
            className="vl-dialog-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* 主体内容承载区 */}
        <div className="vl-dialog-body">{children}</div>

        {/* 底部操作按钮栏 */}
        {footer && (
          <div className="vl-dialog-footer" data-slot="footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
