import React from "react";
import "./VeyLoading.css";

export interface VeyLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示加载中 */
  loading: boolean;
  /** 提示文字 */
  text?: string;
  /** 是否覆盖父容器 */
  cover?: boolean;
}

export const VeyLoading: React.FC<VeyLoadingProps> = ({
  loading,
  text,
  cover = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <div
      className={`vl-loading-host ${cover ? "is-cover" : ""} ${
        loading ? "is-loading" : ""
      } ${className}`.trim()}
      aria-busy={loading}
      {...rest}
    >
      {children}
      {loading && (
        <div className="vl-loading-mask" role="status" aria-live="polite">
          <div className="vl-loading-spinner">
            <svg className="vl-spinner" viewBox="0 0 50 50">
              <circle
                className="path"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"
              />
            </svg>
            {text && <p className="vl-loading-text">{text}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
