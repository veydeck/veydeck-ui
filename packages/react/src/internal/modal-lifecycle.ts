let bodyLockCount = 0;
let previousBodyOverflow = "";

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function activateModalLifecycle(
  container: HTMLElement,
  close: () => void,
): () => void {
  const previousFocus = document.activeElement as HTMLElement | null;
  if (bodyLockCount++ === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  queueMicrotask(() => {
    const first = container.querySelector<HTMLElement>(focusableSelector);
    (first ?? container).focus();
  });
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = [
      ...container.querySelectorAll<HTMLElement>(focusableSelector),
    ];
    if (items.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener("keydown", handleKeydown);
  return () => {
    document.removeEventListener("keydown", handleKeydown);
    bodyLockCount = Math.max(0, bodyLockCount - 1);
    if (bodyLockCount === 0)
      document.body.style.overflow = previousBodyOverflow;
    if (previousFocus?.isConnected) previousFocus.focus();
  };
}
