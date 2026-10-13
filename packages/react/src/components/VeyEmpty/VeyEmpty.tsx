import React from "react";
import { VeyIcon } from "../VeyIcon/VeyIcon";
import "./VeyEmpty.css";

export interface VeyEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 描述文字 */
  description?: string;
  /** VDL 图标名称 */
  icon?: string;
  /** 自定义图标节点，会覆盖 icon 属性 */
  iconNode?: React.ReactNode;
  /** 额外内容 */
  extra?: React.ReactNode;
  /** 子元素，将作为 description 渲染 */
  children?: React.ReactNode;
}

export const VeyEmpty: React.FC<VeyEmptyProps> = ({
  description = "暂无数据",
  icon = "empty",
  iconNode,
  extra,
  className = "",
  children,
  ...rest
}) => {
  return (
    <div className={`vl-empty ${className}`.trim()} {...rest}>
      <div className="vl-empty-icon">
        {iconNode || <VeyIcon name={icon} size={48} />}
      </div>
      <p className="vl-empty-description">{children || description}</p>
      {extra && <div className="vl-empty-extra">{extra}</div>}
    </div>
  );
};
