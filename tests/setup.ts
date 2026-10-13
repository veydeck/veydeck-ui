import "@testing-library/jest-dom/vitest";

Element.prototype.scrollIntoView ??= () => undefined;
globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
