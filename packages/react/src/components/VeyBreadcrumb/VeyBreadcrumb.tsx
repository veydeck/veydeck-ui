import React from "react";
import { BreadcrumbContext } from "./breadcrumb-context";
import "./VeyBreadcrumb.css";

export interface VeyBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** 分隔符 */
  separator?: string;
}

export const VeyBreadcrumb: React.FC<VeyBreadcrumbProps> = ({
  separator = "/",
  className = "",
  children,
  ...rest
}) => {
  return (
    <BreadcrumbContext.Provider value={separator}>
      <nav
        className={`vl-breadcrumb ${className}`.trim()}
        aria-label="Breadcrumb"
        {...rest}
      >
        {children}
      </nav>
    </BreadcrumbContext.Provider>
  );
};
