import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyTooltip.css";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface VeyTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 提示文字内容 */
  text: string;
  /** 显示位置 */
  position?: TooltipPosition;
  /** 显示延迟 (ms) */
  delay?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子元素 */
  children: React.ReactNode;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeyTooltip: React.FC<VeyTooltipProps> = ({
  text,
  position = "top",
  delay = 200,
  children,
  disabled = false,
  glass,
  className = "",
  ...rest
}) => {
  const tooltipId = useId();
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [actualPosition, setActualPosition] =
    useState<TooltipPosition>(position);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipGlassRef = useGlass<HTMLDivElement>(glass, "surface");

  const timerRef = useRef<any>(null);
  const animationTimerRef = useRef<any>(null);

  const calculatePosition = useCallback(
    (node: HTMLDivElement) => {
      if (!triggerRef.current || !node) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = node.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 5;

      let top = 0;
      let left = 0;

      const triggerCenterY = triggerRect.top + triggerRect.height / 2;
      const triggerCenterX = triggerRect.left + triggerRect.width / 2;
      const offset = 8;

      let placement = position;
      const fits = (candidate: TooltipPosition) => {
        if (candidate === "top")
          return triggerRect.top - tooltipRect.height - offset >= margin;
        if (candidate === "bottom")
          return (
            triggerRect.bottom + tooltipRect.height + offset <=
            viewportHeight - margin
          );
        if (candidate === "left")
          return triggerRect.left - tooltipRect.width - offset >= margin;
        return (
          triggerRect.right + tooltipRect.width + offset <=
          viewportWidth - margin
        );
      };
      const opposite: Record<TooltipPosition, TooltipPosition> = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left",
      };
      if (!fits(placement) && fits(opposite[placement]))
        placement = opposite[placement];
      setActualPosition(placement);

      switch (placement) {
        case "top":
        case "bottom":
          top =
            placement === "top"
              ? triggerRect.top - tooltipRect.height - offset
              : triggerRect.bottom + offset;
          left = triggerCenterX - tooltipRect.width / 2;

          if (left < margin) left = margin;
          const rightEdge = left + tooltipRect.width;
          const viewportRight = viewportWidth - margin;

          if (rightEdge > viewportRight) {
            left = Math.max(margin, left - (rightEdge - viewportRight));
          }
          break;

        case "left":
        case "right":
          top = triggerCenterY - tooltipRect.height / 2;
          left =
            placement === "left"
              ? triggerRect.left - tooltipRect.width - offset
              : triggerRect.right + offset;
          break;
      }

      top = Math.min(
        Math.max(top, margin),
        Math.max(margin, viewportHeight - margin - tooltipRect.height),
      );
      left = Math.min(
        Math.max(left, margin),
        Math.max(margin, viewportWidth - margin - tooltipRect.width),
      );
      setTooltipStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
      });
    },
    [position],
  );

  const setTooltipRef = useCallback(
    (node: HTMLDivElement | null) => {
      tooltipRef.current = node;
      tooltipGlassRef(node);
      if (node) {
        calculatePosition(node);
      }
    },
    [calculatePosition, tooltipGlassRef],
  );

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (animationTimerRef.current)
      window.clearTimeout(animationTimerRef.current);

    if (isRendered) {
      setIsVisible(true);
    } else {
      timerRef.current = window.setTimeout(() => {
        setIsRendered(true);
        // wait a tiny bit to trigger CSS transition
        timerRef.current = window.setTimeout(() => {
          setIsVisible(true);
        }, 20);
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (animationTimerRef.current)
      window.clearTimeout(animationTimerRef.current);

    setIsVisible(false);
    animationTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
    }, 200);
  };

  // recalculate position on scroll or resize when visible
  useEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => {
      if (tooltipRef.current) {
        calculatePosition(tooltipRef.current);
      }
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (animationTimerRef.current)
        window.clearTimeout(animationTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`vl-tooltip-wrapper ${className}`.trim()}
      ref={triggerRef}
      aria-describedby={isVisible && text ? tooltipId : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
      {isRendered &&
        text &&
        !disabled &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={setTooltipRef}
            id={tooltipId}
            className={`vl-tooltip-content ${isVisible ? "is-visible" : ""}`.trim()}
            role="tooltip"
            style={tooltipStyle}
            data-position={actualPosition}
          >
            {text}
            <span
              className="vl-tooltip-arrow"
              data-position={actualPosition}
            ></span>
          </div>,
          document.body,
        )}
    </div>
  );
};
