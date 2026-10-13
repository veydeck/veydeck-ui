/**
 * @file types.ts
 * @description Veydeck 套件 SDK 公开类型定义。
 */

import type {
  SECLAB_SUITE_PROTOCOL_VERSION,
  SUITE_MESSAGE_TYPES,
} from "./protocol";

export type SuiteProtocolVersion = typeof SECLAB_SUITE_PROTOCOL_VERSION;
export type SuiteMessageSource = "veydeck-suite" | "veydeck-host";
export type SuiteResolvedTheme = "light" | "dark";
export type SuiteThemeMode = SuiteResolvedTheme | "auto";
export type SuiteThemeSource = "host" | "system";
export type SuiteLocaleSource = "host" | "browser" | "default";
export type SuiteRunMode = "hosted" | "standalone";
export type SuiteNotificationType = "info" | "success" | "warning" | "error";
export type SuiteCapability =
  | "theme"
  // SDK 已支持 locale 状态同步；具体业务 i18n 由套件按需接入。
  | "locale"
  // 蓝图占位：主控上下文，后续用于提供 suiteId、instanceId、basePath 等信息。
  | "context"
  // 统一通知：作为套件运行时由主控承载 toast/notification。
  | "notification"
  // 蓝图占位：统一确认对话框，后续用于危险操作确认。
  | "dialog"
  // 蓝图占位：主控导航，后续用于打开应用、外链或切换主控页面。
  | "navigation"
  // 蓝图占位：窗口状态，后续用于标题、未保存变更等窗口集成。
  | "window"
  // 蓝图占位：文件能力，后续用于导入、导出和文件选择。
  | "file"
  // 蓝图占位：诊断能力，后续用于错误上报和统一日志。
  | "diagnostics"
  // 蓝图占位：健康状态，后续用于心跳和卡死检测。
  | "heartbeat";
export type SuiteMessageType =
  (typeof SUITE_MESSAGE_TYPES)[keyof typeof SUITE_MESSAGE_TYPES];
export type SuiteMessageHandler<TPayload = unknown> = (
  message: SuiteMessage<TPayload>,
  event: MessageEvent,
) => void;
export type SuiteThemeSubscriber = (theme: SuiteThemeState) => void;
export type SuiteLocaleSubscriber = (locale: SuiteLocaleState) => void;
export type SuiteUnsubscribe = () => void;

export interface SuiteMessage<TPayload = unknown> {
  protocolVersion: SuiteProtocolVersion;
  source: SuiteMessageSource;
  type: string;
  id?: string;
  requestId?: string;
  payload?: TPayload;
  error?: SuiteMessageError;
}

export interface SuiteMessageError {
  code: string;
  message: string;
  details?: unknown;
}

export interface SuiteThemeState {
  theme: SuiteThemeMode;
  resolvedTheme: SuiteResolvedTheme;
  glassEnabled: boolean;
  source: SuiteThemeSource;
}

export interface SuiteThemePayload {
  theme: SuiteThemeMode;
  resolvedTheme: SuiteResolvedTheme;
  /** 主控 Liquid Glass 偏好；旧载荷缺省时按开启处理。 */
  glassEnabled?: boolean;
}

export interface SuiteLocaleState {
  locale: string;
  source: SuiteLocaleSource;
}

export interface SuiteLocalePayload {
  locale: string;
}

export interface SuiteContextPayload {
  suiteId: string;
  instanceId?: string;
  appId?: string;
  runMode: SuiteRunMode;
  basePath?: string;
  user?: {
    id: string;
    name?: string;
  };
  node?: {
    id: string;
    name?: string;
  };
}

export interface SuiteNotificationPayload {
  type?: SuiteNotificationType;
  title: string;
  message?: string;
  duration?: number;
}

export interface SuiteConfirmDialogPayload {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface SuiteNavigationPayload {
  target: "app" | "url" | "suite-center" | "desktop";
  value?: string;
  payload?: Record<string, unknown>;
  external?: boolean;
}

export interface SuiteWindowTitlePayload {
  title: string;
}

/**
 * 套件请求主控聚焦承载窗口的原因，用于后续诊断或策略分流。
 */
export interface SuiteWindowFocusPayload {
  reason: "pointer" | "focus" | "manual";
}

export interface SuiteWindowDirtyPayload {
  dirty: boolean;
}

export interface SuiteLogEventPayload {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  details?: unknown;
}

export interface SuiteLifecycleStatusPayload {
  status: "ready" | "busy" | "idle" | "error";
  message?: string;
}

export interface SuiteReadyPayload {
  capabilities: SuiteCapability[];
}

export interface CreateSuiteBridgeOptions {
  capabilities?: SuiteCapability[];
  target?: Document | HTMLElement;
  parentWindow?: Window;
  targetOrigin?: string;
  applyTheme?: boolean;
  supportedLocales?: string[];
  defaultLocale?: string;
  onThemeChange?: SuiteThemeSubscriber;
  onLocaleChange?: SuiteLocaleSubscriber;
}

export interface SuiteBridge {
  ready: () => void;
  /**
   * 请求主控展示统一通知；独立运行或主控不可用时返回 false，套件应使用本地通知降级。
   */
  notify: (payload: SuiteNotificationPayload) => boolean;
  /**
   * 请求主控执行导航动作，例如打开主控内置应用或跳转外链。
   */
  navigate: (payload: SuiteNavigationPayload) => boolean;
  /**
   * 手动请求主控聚焦承载窗口；常规点击和焦点变化由 SDK 自动上报。
   */
  requestWindowFocus: () => void;
  postMessage: <TPayload = unknown>(type: string, payload?: TPayload) => void;
  onMessage: <TPayload = unknown>(
    type: string,
    handler: SuiteMessageHandler<TPayload>,
  ) => SuiteUnsubscribe;
  subscribeTheme: (subscriber: SuiteThemeSubscriber) => SuiteUnsubscribe;
  subscribeLocale: (subscriber: SuiteLocaleSubscriber) => SuiteUnsubscribe;
  getThemeSnapshot: () => SuiteThemeState;
  getLocaleSnapshot: () => SuiteLocaleState;
  destroy: () => void;
}

export interface CreateSuiteHostBridgeOptions {
  iframe: HTMLIFrameElement | (() => HTMLIFrameElement | null);
  theme:
    | SuiteThemeMode
    | SuiteThemePayload
    | (() => SuiteThemeMode | SuiteThemePayload);
  locale?: string | SuiteLocalePayload | (() => string | SuiteLocalePayload);
  targetOrigin?: string;
  onReady?: (payload: SuiteReadyPayload, event: MessageEvent) => void;
  onMessage?: SuiteMessageHandler;
}

export interface SuiteHostBridge {
  sendTheme: () => void;
  sendLocale: () => void;
  postMessage: <TPayload = unknown>(type: string, payload?: TPayload) => void;
  destroy: () => void;
}
