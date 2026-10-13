/**
 * @file host-bridge.ts
 * @description 主控端 Bridge 实现。
 */

import { isBrowser, resolveIframe } from "./environment";
import { createMessage, isSuiteMessage, SUITE_MESSAGE_TYPES } from "./protocol";
import { normalizeTheme } from "./theme";
import type {
  CreateSuiteHostBridgeOptions,
  SuiteHostBridge,
  SuiteLocalePayload,
  SuiteReadyPayload,
  SuiteThemePayload,
} from "./types";

/**
 * @description 创建主控端 Bridge，负责向套件 iframe 推送主控主题与语言。
 */
export function createSuiteHostBridge(
  options: CreateSuiteHostBridgeOptions,
): SuiteHostBridge {
  const targetOrigin = options.targetOrigin ?? "*";
  let destroyed = false;

  const getThemePayload = (): SuiteThemePayload => {
    const input =
      typeof options.theme === "function" ? options.theme() : options.theme;
    return normalizeTheme(input);
  };

  const getLocalePayload = (): SuiteLocalePayload | null => {
    if (typeof options.locale === "undefined") {
      return null;
    }

    const input =
      typeof options.locale === "function" ? options.locale() : options.locale;
    return typeof input === "string" ? { locale: input } : input;
  };

  const postMessage = <TPayload = unknown>(
    type: string,
    payload?: TPayload,
  ) => {
    if (destroyed) {
      return;
    }

    const iframe = resolveIframe(options.iframe);
    iframe?.contentWindow?.postMessage(
      createMessage("veydeck-host", type, payload),
      targetOrigin,
    );
  };

  const sendTheme = () => {
    postMessage<SuiteThemePayload>(
      SUITE_MESSAGE_TYPES.hostThemeUpdate,
      getThemePayload(),
    );
  };

  const sendLocale = () => {
    const payload = getLocalePayload();
    if (payload) {
      postMessage<SuiteLocalePayload>(
        SUITE_MESSAGE_TYPES.hostLocaleUpdate,
        payload,
      );
    }
  };

  const handleMessage = (event: MessageEvent) => {
    const iframe = resolveIframe(options.iframe);
    if (
      !iframe ||
      event.source !== iframe.contentWindow ||
      !isSuiteMessage(event.data)
    ) {
      return;
    }

    const message = event.data;
    if (message.source !== "veydeck-suite") {
      return;
    }

    if (message.type === SUITE_MESSAGE_TYPES.lifecycleReady) {
      const readyPayload = message.payload as SuiteReadyPayload;
      options.onReady?.(readyPayload, event);
      sendTheme();
      if (readyPayload.capabilities.includes("locale")) {
        sendLocale();
      }
    }

    options.onMessage?.(message, event);
  };

  if (isBrowser()) {
    window.addEventListener("message", handleMessage);
  }

  return {
    sendTheme,
    sendLocale,
    postMessage,
    destroy() {
      destroyed = true;
      if (isBrowser()) {
        window.removeEventListener("message", handleMessage);
      }
    },
  };
}
