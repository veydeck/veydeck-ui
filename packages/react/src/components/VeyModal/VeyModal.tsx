import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { activateModalLifecycle } from "../../internal/modal-lifecycle";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyModal.css";

export interface VeyModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否可见 */
  visible: boolean;
  /** 标题 */
  title: string;
  /** 消息内容 */
  message: string;
  /** 确认按钮文案 */
  confirmText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 确认按钮类型 */
  type?: "primary" | "danger" | "warning";
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeyModal: React.FC<VeyModalProps> = ({
  visible,
  title,
  message,
  confirmText = "确定",
  cancelText = "取消",
  type = "primary",
  onConfirm,
  onCancel,
  glass,
  className = "",
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  const titleId = useId();
  useEffect(() => {
    if (!visible || !cardRef.current) return;
    return activateModalLifecycle(cardRef.current, () => onCancel?.());
  }, [visible, onCancel]);
  if (!visible) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel?.();
    }
  };

  return createPortal(
    <div
      className={`vl-modal-overlay ${className}`.trim()}
      onClick={handleOverlayClick}
      role="presentation"
      {...rest}
    >
      <div
        ref={(node) => {
          cardRef.current = node;
          glassRef(node);
        }}
        className="vl-modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* 头部标题栏 */}
        <div className="vl-modal-header" data-slot="header">
          <h3 id={titleId} className="vl-modal-title">
            {title}
          </h3>
        </div>

        {/* 消息内容 */}
        <div className="vl-modal-body">
          <p className="vl-modal-message">{message}</p>
        </div>

        {/* 底部操作按钮栏 */}
        <div className="vl-modal-footer" data-slot="footer">
          <button
            type="button"
            className="vl-modal-btn is-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`vl-modal-btn is-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
