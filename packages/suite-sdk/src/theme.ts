/**
 * @file theme.ts
 * @description 主题状态解析与 DOM 应用逻辑。
 */

import { isBrowser } from "./environment";
import type {
  SuiteResolvedTheme,
  SuiteThemeMode,
  SuiteThemePayload,
  SuiteThemeSource,
  SuiteThemeState,
} from "./types";

export function resolveSystemTheme(): SuiteResolvedTheme {
  if (!isBrowser() || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function isThemeMode(value: unknown): value is SuiteThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

export function normalizeTheme(
  input: SuiteThemeMode | SuiteThemePayload,
): SuiteThemePayload {
  if (typeof input === "string") {
    return {
      theme: isThemeMode(input) ? input : "auto",
      resolvedTheme: input === "auto" ? resolveSystemTheme() : input,
      glassEnabled: true,
    };
  }

  if (!input || typeof input !== "object") {
    return {
      theme: "auto",
      resolvedTheme: resolveSystemTheme(),
      glassEnabled: true,
    };
  }

  return {
    theme: isThemeMode(input.theme) ? input.theme : "auto",
    resolvedTheme:
      input.resolvedTheme === "dark" || input.resolvedTheme === "light"
        ? input.resolvedTheme
        : input.theme === "dark"
          ? "dark"
          : "light",
    glassEnabled:
      typeof input.glassEnabled === "boolean" ? input.glassEnabled : true,
  };
}

export function resolveThemeState(
  input: SuiteThemeMode | SuiteThemePayload,
  source: SuiteThemeSource,
): SuiteThemeState {
  const normalized = normalizeTheme(input);
  return {
    ...normalized,
    glassEnabled: normalized.glassEnabled ?? true,
    source,
  };
}

export function applyThemeToTarget(
  target: Document | HTMLElement,
  theme: SuiteThemeState,
) {
  const element = "documentElement" in target ? target.documentElement : target;
  element.dataset.theme = theme.resolvedTheme;
  element.dataset.glass = theme.glassEnabled ? "enabled" : "disabled";
  element.style.colorScheme = theme.resolvedTheme;
}
