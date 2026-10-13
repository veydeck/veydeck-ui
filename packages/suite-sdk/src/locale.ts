/**
 * @file locale.ts
 * @description 国际化语言状态解析与降级逻辑。
 */

import { isBrowser } from "./environment";
import type { SuiteLocalePayload, SuiteLocaleState } from "./types";

function normalizeLocaleTag(locale: string): string | undefined {
  const normalized = locale.trim();
  return normalized ? normalized : undefined;
}

function matchSupportedLocale(locale: string, supportedLocales: string[]) {
  const normalizedLocale = normalizeLocaleTag(locale);
  if (!normalizedLocale) {
    return undefined;
  }

  if (
    supportedLocales.length === 0 ||
    supportedLocales.includes(normalizedLocale)
  ) {
    return normalizedLocale;
  }

  const localePrefix = normalizedLocale.split("-")[0];
  return supportedLocales.find((item) => item.split("-")[0] === localePrefix);
}

export function resolveBrowserLocale(
  supportedLocales: string[],
  defaultLocale: string,
): SuiteLocaleState {
  if (!isBrowser()) {
    return {
      locale: defaultLocale,
      source: "default",
    };
  }

  const candidates = [...navigator.languages, navigator.language].filter(
    Boolean,
  );
  for (const candidate of candidates) {
    const matched = matchSupportedLocale(candidate, supportedLocales);
    if (matched) {
      return {
        locale: matched,
        source: "browser",
      };
    }
  }

  return {
    locale: defaultLocale,
    source: "default",
  };
}

export function normalizeLocale(
  input: string | SuiteLocalePayload,
  supportedLocales: string[],
  defaultLocale: string,
): SuiteLocalePayload {
  const rawLocale = typeof input === "string" ? input : input?.locale;
  const matched =
    typeof rawLocale === "string"
      ? matchSupportedLocale(rawLocale, supportedLocales)
      : undefined;

  return {
    locale: matched ?? defaultLocale,
  };
}
