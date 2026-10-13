import React, { useMemo } from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyPagination.css";

export interface VeyPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 当前页码 (从 1 开始) */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 最大可见页码数，默认为 5 */
  maxVisibleButtons?: number;
  /** 页码改变时的回调 */
  onPageChange?: (page: number) => void;
  ariaLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

const PaginationButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { glass?: VeyGlassValue }
> = ({ glass, ...props }) => {
  const glassRef = useGlass<HTMLButtonElement>(glass, "control");
  return <button ref={glassRef} {...props} />;
};

export const VeyPagination: React.FC<VeyPaginationProps> = ({
  currentPage,
  totalPages,
  maxVisibleButtons = 5,
  onPageChange,
  ariaLabel = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  glass,
  className = "",
  ...rest
}) => {
  const pages = useMemo(() => {
    const total = totalPages;
    const current = currentPage;
    const max = maxVisibleButtons;
    const r: (number | string)[] = [];

    if (total <= max) {
      for (let i = 1; i <= total; i++) {
        r.push(i);
      }
    } else {
      const half = Math.floor(max / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(total, current + half);

      if (current - start < half) {
        end += half - (current - start);
      }
      if (end - current < half) {
        start -= half - (end - current);
      }

      start = Math.max(1, start);
      end = Math.min(total, end);

      if (start > 1) {
        r.push(1);
        if (start > 2) {
          r.push("...");
        }
      }
      for (let i = start; i <= end; i++) {
        r.push(i);
      }
      if (end < total) {
        if (end < total - 1) {
          r.push("...");
        }
        r.push(total);
      }
    }
    return r;
  }, [currentPage, totalPages, maxVisibleButtons]);

  if (totalPages <= 1) return null;

  const changePage = (page: number | string) => {
    if (typeof page === "number" && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <nav
      className={`vl-pagination ${className}`.trim()}
      aria-label={ariaLabel}
      {...rest}
    >
      <PaginationButton
        glass={glass}
        type="button"
        className="vl-pagination-btn"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={previousLabel}
      >
        &lt;
      </PaginationButton>

      {pages.map((page, index) => {
        const isActive = page === currentPage;
        const isEllipsis = typeof page === "string";
        return isEllipsis ? (
          <span
            key={index}
            className="vl-pagination-ellipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <PaginationButton
            glass={glass}
            key={index}
            type="button"
            className={`vl-pagination-btn ${isActive ? "active" : ""} ${isEllipsis ? "ellipsis" : ""}`.trim()}
            onClick={() => changePage(page)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </PaginationButton>
        );
      })}

      <PaginationButton
        glass={glass}
        type="button"
        className="vl-pagination-btn"
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={nextLabel}
      >
        &gt;
      </PaginationButton>
    </nav>
  );
};
