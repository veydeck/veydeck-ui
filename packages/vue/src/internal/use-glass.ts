import { computed, inject, watchEffect, type ObjectDirective } from "vue";
import {
  glassContext,
  type VeyGlassValue,
  type VeyGlassProfile,
} from "../glass";
import { mountGlass } from "./glass-renderer";
import "./glass.css";

/** A directive keeps material on the actual surface, including Teleport roots. */
export function useGlass(
  getValue: () => VeyGlassValue | undefined,
  profile: VeyGlassProfile = "control",
) {
  const inherited = inject(glassContext, undefined);
  const resolved = computed(() => {
    const value = getValue() ?? inherited?.value.value;
    // Snapshot reactive fields here; the DOM renderer reads them in a later frame.
    return typeof value === "object" && value ? { ...value } : value;
  });
  const cleanups = new WeakMap<HTMLElement, () => void>();
  function remove(element: HTMLElement) {
    cleanups.get(element)?.();
    cleanups.delete(element);
    element.classList.remove("vl-glass");
    delete element.dataset.glassMode;
    for (const property of ["opacity", "highlight", "filter"])
      element.style.removeProperty(`--vl-glass-${property}`);
  }
  function apply(element: HTMLElement, active: boolean | undefined) {
    if (active === false) {
      remove(element);
      return;
    }
    // Vue can replace the class attribute when a selection/disabled state changes.
    element.classList.add("vl-glass");
    if (!cleanups.has(element)) {
      const renderer = mountGlass(element, profile);
      const originalTheme = element.getAttribute("data-theme");
      const copiedTokens = new Set<string>();
      const stop = watchEffect(() => {
        renderer.update(resolved.value);
        const theme = inherited?.theme.value;
        if (!originalTheme) {
          if (theme) element.setAttribute("data-theme", theme);
          else element.removeAttribute("data-theme");
        }
        const scope = inherited?.scope.value;
        if (scope && !scope.contains(element)) {
          const tokens = inherited?.tokens.value ?? {};
          for (const key of copiedTokens) {
            if (!(key in tokens)) {
              element.style.removeProperty(key);
              copiedTokens.delete(key);
            }
          }
          for (const [key, value] of Object.entries(tokens)) {
            if (copiedTokens.has(key) || !element.style.getPropertyValue(key)) {
              element.style.setProperty(key, value);
              copiedTokens.add(key);
            }
          }
        }
      });
      cleanups.set(element, () => {
        stop();
        renderer.dispose();
        if (!originalTheme) element.removeAttribute("data-theme");
        for (const key of copiedTokens) element.style.removeProperty(key);
      });
    }
  }
  const directive: ObjectDirective<HTMLElement, boolean | undefined> = {
    mounted(element, binding) {
      apply(element, binding.value);
    },
    updated(element, binding) {
      apply(element, binding.value);
    },
    unmounted: remove,
  };
  return directive;
}
