import React from "react";
import { createPortal } from "react-dom";
import { VeyIcon } from "../VeyIcon/VeyIcon";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyToast.css";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface VeyToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 通知列表 */
  toasts: ToastItem[];
  /** 关闭事件 */
  onClose?: (id: string) => void;
  /** 关闭按钮的无障碍标签 */
  closeLabel?: string;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

const ToastView: React.FC<{
  toast: ToastItem;
  closeLabel: string;
  glass?: VeyGlassValue;
  onClose?: (id: string) => void;
}> = ({ toast, closeLabel, glass, onClose }) => {
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  const iconName =
    toast.type === "success"
      ? "success"
      : toast.type === "error"
        ? "error"
        : toast.type === "warning"
          ? "warning"
          : "info";

  return (
    <div
      ref={glassRef}
      className={`vl-toast-item is-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <div className="vl-toast-icon">
        <VeyIcon name={iconName} size={20} />
      </div>
      <div className="vl-toast-content">
        <h4 className="vl-toast-title">{toast.title}</h4>
        <p className="vl-toast-message">{toast.message}</p>
      </div>
      <button
        type="button"
        className="vl-toast-close"
        aria-label={closeLabel}
        onClick={() => onClose?.(toast.id)}
      >
        &times;
      </button>
    </div>
  );
};

export const VeyToast: React.FC<VeyToastProps> = ({
  toasts = [],
  onClose,
  closeLabel = "Close notification",
  glass,
  className = "",
  ...rest
}) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`vl-toast-container ${className}`.trim()}
      aria-live="polite"
      aria-relevant="additions"
      {...rest}
    >
      {toasts.map((toast) => (
        <ToastView
          key={toast.id}
          toast={toast}
          closeLabel={closeLabel}
          glass={glass}
          onClose={onClose}
        />
      ))}
    </div>,
    document.body,
  );
};
