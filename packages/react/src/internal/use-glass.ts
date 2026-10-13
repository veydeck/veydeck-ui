import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";
import {
  glassContext,
  type VeyGlassProfile,
  type VeyGlassValue,
} from "../glass";
import { mountGlass } from "./glass-renderer";
import "./glass.css";

const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** 将 Liquid Glass 生命周期绑定到 React 组件的真实表面节点。 */
export function useGlass<T extends HTMLElement>(
  value: VeyGlassValue | undefined,
  profile: VeyGlassProfile = "control",
  active = true,
): RefCallback<T> {
  const inherited = useContext(glassContext);
  const [element, setElement] = useState<T | null>(null);
  const session = useRef<
    | {
        renderer: ReturnType<typeof mountGlass>;
        originalTheme: string | null;
        copiedTokens: Set<string>;
      }
    | undefined
  >(undefined);
  const ref = useCallback((node: T | null) => setElement(node), []);
  const resolved = value ?? inherited?.value;
  const snapshot = useMemo(
    () =>
      typeof resolved === "object" && resolved ? { ...resolved } : resolved,
    [resolved],
  );

  useClientLayoutEffect(() => {
    if (!element || !active) return;
    const current = {
      renderer: mountGlass(element, profile),
      originalTheme: element.getAttribute("data-theme"),
      copiedTokens: new Set<string>(),
    };
    session.current = current;
    element.classList.add("vl-glass");
    return () => {
      current.renderer.dispose();
      element.classList.remove("vl-glass");
      delete element.dataset.glassMode;
      for (const property of ["opacity", "highlight", "filter"])
        element.style.removeProperty(`--vl-glass-${property}`);
      if (!current.originalTheme) element.removeAttribute("data-theme");
      for (const key of current.copiedTokens) element.style.removeProperty(key);
      if (session.current === current) session.current = undefined;
    };
  }, [active, element, profile]);

  useClientLayoutEffect(() => {
    if (!active || !element || !session.current) return;
    const current = session.current;
    current.renderer.update(snapshot);
    if (!current.originalTheme) {
      if (inherited?.theme) element.setAttribute("data-theme", inherited.theme);
      else element.removeAttribute("data-theme");
    }
    if (inherited?.scope && !inherited.scope.contains(element)) {
      const tokens = inherited.tokens;
      for (const key of current.copiedTokens) {
        if (!(key in tokens)) {
          element.style.removeProperty(key);
          current.copiedTokens.delete(key);
        }
      }
      for (const [key, token] of Object.entries(tokens)) {
        if (
          current.copiedTokens.has(key) ||
          !element.style.getPropertyValue(key)
        ) {
          element.style.setProperty(key, token);
          current.copiedTokens.add(key);
        }
      }
    }
  }, [active, element, inherited, snapshot]);

  return ref;
}
