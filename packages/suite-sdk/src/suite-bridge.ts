/**
 * @file suite-bridge.ts
 * @description 套件端 Bridge 实现。
 */

import { isBrowser } from "./environment";
import { normalizeLocale, resolveBrowserLocale } from "./locale";
import { createMessage, isSuiteMessage, SUITE_MESSAGE_TYPES } from "./protocol";
import { applyThemeToTarget, resolveThemeState } from "./theme";
import type {
  CreateSuiteBridgeOptions,
  SuiteBridge,
  SuiteLocalePayload,
  SuiteLocaleState,
  SuiteLocaleSubscriber,
  SuiteMessageHandler,
  SuiteNavigationPayload,
  SuiteNotificationPayload,
  SuiteReadyPayload,
  SuiteThemePayload,
  SuiteThemeState,
  SuiteThemeSubscriber,
  SuiteWindowFocusPayload,
} from "./types";

/**
 * @description 创建套件端 Bridge，负责向主控报告就绪状态并接收主控主题与语言。
 */
export function createSuiteBridge(
  options: CreateSuiteBridgeOptions = {},
): SuiteBridge {
  const capabilities = options.capabilities ?? ["theme"];
  const target = options.target ?? (isBrowser() ? document : undefined);
  const parentWindow =
    options.parentWindow ?? (isBrowser() ? window.parent : undefined);
  const targetOrigin = options.targetOrigin ?? "*";
  const shouldApplyTheme = options.applyTheme ?? true;
  const supportedLocales = options.supportedLocales ?? [];
  const defaultLocale = options.defaultLocale ?? "zh-CN";
  const messageHandlers = new Map<string, Set<SuiteMessageHandler>>();
  const themeSubscribers = new Set<SuiteThemeSubscriber>();
  const localeSubscribers = new Set<SuiteLocaleSubscriber>();
  let destroyed = false;
  let themeState = resolveThemeState("auto", "system");
  let localeState = resolveBrowserLocale(supportedLocales, defaultLocale);
  // 聚焦上报会被 pointerdown 和 focusin 同时触发，节流避免主控窗口层级频繁变化。
  let lastWindowFocusReportedAt = 0;

  const notifyTheme = () => {
    for (const subscriber of themeSubscribers) {
      subscriber(themeState);
    }
  };

  const notifyLocale = () => {
    for (const subscriber of localeSubscribers) {
      subscriber(localeState);
    }
  };

  const setThemeState = (next: SuiteThemeState) => {
    themeState = next;
    if (shouldApplyTheme && target) {
      applyThemeToTarget(target, themeState);
    }
    notifyTheme();
  };

  const setLocaleState = (next: SuiteLocaleState) => {
    localeState = next;
    notifyLocale();
  };

  const postMessage = <TPayload = unknown>(
    type: string,
    payload?: TPayload,
  ) => {
    if (destroyed || !parentWindow) {
      return;
    }
    parentWindow.postMessage(
      createMessage("veydeck-suite", type, payload),
      targetOrigin,
    );
  };

  const canPostToHost = () =>
    !destroyed && !!parentWindow && (!isBrowser() || parentWindow !== window);

  const notify = (payload: SuiteNotificationPayload) => {
    if (!capabilities.includes("notification") || !canPostToHost()) {
      return false;
    }

    postMessage<SuiteNotificationPayload>(
      SUITE_MESSAGE_TYPES.suiteNotificationShow,
      payload,
    );
    return true;
  };

  const navigate = (payload: SuiteNavigationPayload) => {
    if (!capabilities.includes("navigation") || !canPostToHost()) {
      return false;
    }

    postMessage<SuiteNavigationPayload>(
      SUITE_MESSAGE_TYPES.suiteNavigationOpen,
      payload,
    );
    return true;
  };

  const requestWindowFocus = (
    reason: SuiteWindowFocusPayload["reason"] = "manual",
  ) => {
    // iframe 内点击不会冒泡到主控窗口容器，因此通过协议消息让主控聚焦承载窗口。
    const now = Date.now();
    if (now - lastWindowFocusReportedAt < 300) {
      return;
    }
    lastWindowFocusReportedAt = now;
    postMessage<SuiteWindowFocusPayload>(SUITE_MESSAGE_TYPES.suiteWindowFocus, {
      reason,
    });
  };

  const handleMessage = (event: MessageEvent) => {
    if (
      destroyed ||
      !isSuiteMessage(event.data) ||
      event.data.source !== "veydeck-host"
    ) {
      return;
    }

    const message = event.data;
    if (message.type === SUITE_MESSAGE_TYPES.hostThemeUpdate) {
      setThemeState(
        resolveThemeState(message.payload as SuiteThemePayload, "host"),
      );
    }

    if (message.type === SUITE_MESSAGE_TYPES.hostLocaleUpdate) {
      const payload = normalizeLocale(
        message.payload as SuiteLocalePayload,
        supportedLocales,
        defaultLocale,
      );
      setLocaleState({
        locale: payload.locale,
        source: "host",
      });
    }

    const handlers = messageHandlers.get(message.type);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(message, event);
    }
  };

  const mediaQuery =
    isBrowser() && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

  const handleSystemThemeChange = () => {
    if (themeState.source === "host") {
      return;
    }
    setThemeState(resolveThemeState("auto", "system"));
  };

  const handlePointerFocus = () => requestWindowFocus("pointer");
  const handleDomFocus = () => requestWindowFocus("focus");

  if (isBrowser()) {
    window.addEventListener("message", handleMessage);
    mediaQuery?.addEventListener("change", handleSystemThemeChange);
    // 只有声明 window capability 的套件才启用自动聚焦上报，未接入该能力的套件由主控兜底层处理。
    if (capabilities.includes("window")) {
      document.addEventListener("pointerdown", handlePointerFocus, true);
      document.addEventListener("focusin", handleDomFocus, true);
    }
  }

  setThemeState(themeState);

  if (options.onThemeChange) {
    themeSubscribers.add(options.onThemeChange);
  }

  if (options.onLocaleChange) {
    localeSubscribers.add(options.onLocaleChange);
  }

  return {
    ready() {
      postMessage<SuiteReadyPayload>(SUITE_MESSAGE_TYPES.lifecycleReady, {
        capabilities,
      });
    },
    notify,
    navigate,
    requestWindowFocus,
    postMessage,
    onMessage(type, handler) {
      const handlers =
        messageHandlers.get(type) ?? new Set<SuiteMessageHandler>();
      handlers.add(handler as SuiteMessageHandler);
      messageHandlers.set(type, handlers);

      return () => {
        handlers.delete(handler as SuiteMessageHandler);
        if (handlers.size === 0) {
          messageHandlers.delete(type);
        }
      };
    },
    subscribeTheme(subscriber) {
      themeSubscribers.add(subscriber);
      subscriber(themeState);

      return () => {
        themeSubscribers.delete(subscriber);
      };
    },
    subscribeLocale(subscriber) {
      localeSubscribers.add(subscriber);
      subscriber(localeState);

      return () => {
        localeSubscribers.delete(subscriber);
      };
    },
    getThemeSnapshot() {
      return themeState;
    },
    getLocaleSnapshot() {
      return localeState;
    },
    destroy() {
      destroyed = true;
      messageHandlers.clear();
      themeSubscribers.clear();
      localeSubscribers.clear();
      if (isBrowser()) {
        window.removeEventListener("message", handleMessage);
        mediaQuery?.removeEventListener("change", handleSystemThemeChange);
        document.removeEventListener("pointerdown", handlePointerFocus, true);
        document.removeEventListener("focusin", handleDomFocus, true);
      }
    },
  };
}
