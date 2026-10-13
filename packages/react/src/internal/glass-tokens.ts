import { glassTokens } from "@veydeck/tokens/glass";

/** 严格解析公共材质数值，避免把百分比或 rem 静默当成像素。 */
export function glassNumber(
  values: Readonly<Record<string, string>>,
  name: string,
  unit: "" | "px" = "",
  max = 1,
): number {
  const key = `--vdl-glass-${name}`;
  const raw = (values[key] ?? "").trim();
  const pattern =
    unit === "px"
      ? /^(?:\d+(?:\.\d+)?|\.\d+)px$|^0$/
      : /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
  const parsed = pattern.test(raw) ? Number.parseFloat(raw) : NaN;
  const value = Number.isFinite(parsed)
    ? parsed
    : Number.parseFloat(glassTokens[key]);
  return Math.min(max, Math.max(0, value));
}

/** 读取元素作用域内实际生效的公共材质 Token。 */
export function readGlassTokens(
  style: CSSStyleDeclaration,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(glassTokens).map((key) => [
      key,
      style.getPropertyValue(key).trim() || glassTokens[key],
    ]),
  );
}

type Subscription = { element: HTMLElement; refresh: () => void };
const documents = new WeakMap<
  Document,
  {
    observer: MutationObserver;
    subscriptions: Set<Subscription>;
    stop: () => void;
  }
>();

function authorStyle(value: string | null) {
  return (value ?? "")
    .replace(/--vl-glass-[\w-]+\s*:[^;]*(?:;|$)/g, "")
    .replace(/\s+/g, "")
    .replace(/;+$/, "");
}

/** 每个 document 只维护一个观察器，不产生空闲轮询。 */
export function observeGlassTokens(element: HTMLElement, refresh: () => void) {
  const document = element.ownerDocument;
  let state = documents.get(document);
  if (!state) {
    const subscriptions = new Set<Subscription>();
    const observer = new MutationObserver((records) => {
      const changed = new Set<Element>();
      for (const record of records) {
        if (record.type !== "attributes") {
          const isStylesheet = (node: Node) =>
            node.nodeName === "STYLE" || node.nodeName === "LINK";
          if (
            isStylesheet(record.target) ||
            record.target.parentElement?.nodeName === "STYLE" ||
            [...record.addedNodes, ...record.removedNodes].some(isStylesheet)
          )
            changed.add(document.documentElement);
          continue;
        }
        const target = record.target as Element;
        if (record.oldValue === target.getAttribute(record.attributeName!))
          continue;
        if (record.attributeName === "class") {
          const authorClasses = (value: string | null) =>
            (value ?? "")
              .split(/\s+/)
              .filter((name) => name && name !== "vl-glass")
              .sort()
              .join(" ");
          if (
            authorClasses(record.oldValue) ===
            authorClasses(target.getAttribute("class"))
          )
            continue;
        }
        if (
          record.attributeName === "style" &&
          authorStyle(record.oldValue) ===
            authorStyle(target.getAttribute("style"))
        )
          continue;
        changed.add(target);
      }
      for (const subscription of subscriptions) {
        if (
          [...changed].some((target) => target.contains(subscription.element))
        )
          subscription.refresh();
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      childList: true,
      characterData: true,
      attributeFilter: ["style", "class", "data-theme", "data-glass"],
    });
    const refreshAll = () =>
      subscriptions.forEach((subscription) => subscription.refresh());
    const loaded = (event: Event) => {
      if ((event.target as Element)?.nodeName === "LINK") refreshAll();
    };
    const scheme = document.defaultView?.matchMedia?.(
      "(prefers-color-scheme: dark)",
    );
    scheme?.addEventListener("change", refreshAll);
    document.defaultView?.addEventListener("resize", refreshAll);
    document.addEventListener("load", loaded, true);
    state = {
      observer,
      subscriptions,
      stop: () => {
        scheme?.removeEventListener("change", refreshAll);
        document.defaultView?.removeEventListener("resize", refreshAll);
        document.removeEventListener("load", loaded, true);
      },
    };
    documents.set(document, state);
  }
  const subscription = { element, refresh };
  state.subscriptions.add(subscription);
  return () => {
    state!.subscriptions.delete(subscription);
    if (state!.subscriptions.size === 0) {
      state!.observer.disconnect();
      state!.stop();
      documents.delete(document);
    }
  };
}
