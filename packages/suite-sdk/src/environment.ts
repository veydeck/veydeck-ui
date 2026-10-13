/**
 * @file environment.ts
 * @description 浏览器运行环境辅助函数。
 */

export function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function resolveIframe(
  iframe: HTMLIFrameElement | (() => HTMLIFrameElement | null),
): HTMLIFrameElement | null {
  return typeof iframe === "function" ? iframe() : iframe;
}
