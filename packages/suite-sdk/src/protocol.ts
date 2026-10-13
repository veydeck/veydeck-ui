/**
 * @file protocol.ts
 * @description Veydeck 套件 SDK 协议常量与消息工具。
 */

import type { SuiteMessage, SuiteMessageSource } from "./types";

export const SECLAB_SUITE_PROTOCOL_VERSION = 1 as const;

export const SUITE_MESSAGE_TYPES = {
  lifecycleReady: "suite:lifecycle:ready",
  hostThemeUpdate: "host:theme:update",
  hostLocaleUpdate: "host:locale:update",
  // 蓝图占位：以下消息类型当前只定义协议名称，不提供 SDK 运行逻辑。
  hostContextUpdate: "host:context:update",
  hostPermissionGrant: "host:permission:grant",
  hostPermissionDeny: "host:permission:deny",
  suiteNotificationShow: "suite:notification:show",
  suiteDialogConfirm: "suite:dialog:confirm",
  suiteNavigationOpen: "suite:navigation:open",
  // 套件 iframe 内部交互无法冒泡到主控窗口，需显式请求主控聚焦承载窗口。
  suiteWindowFocus: "suite:window:focus",
  suiteWindowTitleUpdate: "suite:window:title:update",
  suiteWindowDirtyUpdate: "suite:window:dirty:update",
  suiteFileOpen: "suite:file:open",
  suiteFileSave: "suite:file:save",
  suiteLogEvent: "suite:log:event",
  suiteErrorReport: "suite:error:report",
  suiteLifecycleHeartbeat: "suite:lifecycle:heartbeat",
  suiteLifecycleStatus: "suite:lifecycle:status",
} as const;

export function isSuiteMessage(value: unknown): value is SuiteMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<SuiteMessage>;
  return (
    message.protocolVersion === SECLAB_SUITE_PROTOCOL_VERSION &&
    (message.source === "veydeck-suite" || message.source === "veydeck-host") &&
    typeof message.type === "string"
  );
}

export function createMessage<TPayload>(
  source: SuiteMessageSource,
  type: string,
  payload?: TPayload,
): SuiteMessage<TPayload> {
  return {
    protocolVersion: SECLAB_SUITE_PROTOCOL_VERSION,
    source,
    type,
    payload,
  };
}
