export type FloatingPlacement = "top" | "bottom";

export interface FloatingPositionOptions {
  anchor: HTMLElement;
  floating: HTMLElement;
  preferred?: FloatingPlacement;
  gap?: number;
  margin?: number;
  maxHeight?: number;
  matchWidth?: boolean;
}

export interface FloatingPosition {
  placement: FloatingPlacement;
  style: Record<string, string>;
}

export function computeFloatingPosition({
  anchor,
  floating,
  preferred = "bottom",
  gap = 4,
  margin = 8,
  maxHeight = 260,
  matchWidth = false,
}: FloatingPositionOptions): FloatingPosition {
  const rect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const below = Math.max(0, viewportHeight - rect.bottom - gap - margin);
  const above = Math.max(0, rect.top - gap - margin);
  const desiredHeight = Math.min(floating.scrollHeight, maxHeight);
  const preferredSpace = preferred === "bottom" ? below : above;
  const alternateSpace = preferred === "bottom" ? above : below;
  const placement =
    preferredSpace < desiredHeight && alternateSpace > preferredSpace
      ? preferred === "bottom"
        ? "top"
        : "bottom"
      : preferred;
  const availableHeight = placement === "bottom" ? below : above;
  const availableWidth = Math.max(0, viewportWidth - margin * 2);
  const width = Math.min(
    Math.max(floating.scrollWidth, matchWidth ? rect.width : 0),
    availableWidth,
  );
  const left = Math.min(
    Math.max(rect.left, margin),
    Math.max(margin, viewportWidth - margin - width),
  );

  return {
    placement,
    style: {
      position: "fixed",
      minWidth: matchWidth ? `${Math.min(rect.width, availableWidth)}px` : "0",
      maxWidth: `${availableWidth}px`,
      maxHeight: `${Math.min(maxHeight, availableHeight)}px`,
      left: `${left}px`,
      top: placement === "bottom" ? `${rect.bottom + gap}px` : "auto",
      bottom:
        placement === "top" ? `${viewportHeight - rect.top + gap}px` : "auto",
      visibility: "visible",
    },
  };
}
