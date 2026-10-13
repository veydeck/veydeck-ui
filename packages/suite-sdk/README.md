# @veydeck/suite-sdk

Veydeck 套件集成 SDK，为运行在 iframe 中的套件 Web 前端提供统一的主控通信协议。

## 能力

- 套件向主控报告就绪状态。
- 主控向套件同步主题。
- 主控向套件同步国际化语言。
- 套件请求主控展示统一通知。
- 套件请求主控执行导航动作，例如打开主控应用、跳转外链或切换主控页面。
- 套件请求主控聚焦承载窗口。
- 套件独立运行时自动使用系统主题和浏览器语言。
- 提供无框架 TypeScript API，Vue、React 或原生前端都可以使用。

设计约定由 `veydeck-docs` 统一维护，见 [Veydeck 套件 SDK 设计规范](https://github.com/veydeck/veydeck-docs/blob/main/suites/Veydeck%E5%A5%97%E4%BB%B6SDK%E8%AE%BE%E8%AE%A1%E8%A7%84%E8%8C%83.md)。

## 安装

```bash
pnpm add @veydeck/suite-sdk
```

## 套件端使用

```ts
import { createSuiteBridge } from "@veydeck/suite-sdk";

const bridge = createSuiteBridge();
bridge.ready();
```

SDK 会把最终主题写入：

```ts
document.documentElement.dataset.theme;
document.documentElement.dataset.glass;
document.documentElement.style.colorScheme;
```

如果需要监听主题变化：

```ts
const unsubscribe = bridge.subscribeTheme((theme) => {
  console.log(theme.resolvedTheme);
  console.log(theme.glassEnabled);
});

unsubscribe();
```

如果套件已经接入国际化，可以声明并监听语言变化：

```ts
const bridge = createSuiteBridge({
  capabilities: ["theme", "locale"],
  supportedLocales: ["zh-CN", "en-US"],
  defaultLocale: "zh-CN",
});

bridge.subscribeLocale((locale) => {
  console.log(locale.locale);
});
```

如果套件需要统一通知，声明 `notification` 能力后调用 `notify()`。主控可用时由主控弹窗；独立运行或主控不可用时返回 `false`，套件应使用自己的本地 toast 降级。

```ts
const bridge = createSuiteBridge({
  capabilities: ["theme", "locale", "notification"],
});

const delivered = bridge.notify({
  type: "success",
  title: "上传成功",
  message: "PCAP 文件已进入解析队列",
});

if (!delivered) {
  showLocalToast("success", "上传成功", "PCAP 文件已进入解析队列");
}
```

如果套件需要通过主控打开应用或跳转页面，声明 `navigation` 能力后调用 `navigate()`。主控可用并且套件处于 iframe 承载环境时返回 `true`；独立运行或主控不可用时返回 `false`，套件应按业务需要降级处理。

```ts
const bridge = createSuiteBridge({
  capabilities: ["theme", "locale", "navigation"],
});

const delivered = bridge.navigate({
  target: "suite-center",
});

if (!delivered) {
  showLocalNavigationHint();
}
```

当前 `navigate()` payload 使用统一结构：

```ts
interface SuiteNavigationPayload {
  target: "app" | "url" | "suite-center" | "desktop";
  value?: string;
  payload?: Record<string, unknown>;
  external?: boolean;
}
```

SDK 只负责发送通用导航请求，具体 `target` 的执行策略由主控承载层决定。

## 主控端使用

```ts
import { createSuiteHostBridge } from "@veydeck/suite-sdk";

const bridge = createSuiteHostBridge({
  iframe: () => iframeElement,
  theme: () => "light",
  locale: () => "zh-CN",
});

bridge.sendTheme();
bridge.sendLocale();
```

主控收到 `suite:lifecycle:ready` 后会自动补发主题。套件声明 `locale` 能力时，主控也会补发语言。

## 协议

所有消息都使用统一 envelope：

```ts
interface SuiteMessage<TPayload = unknown> {
  protocolVersion: 1;
  source: "veydeck-suite" | "veydeck-host";
  type: string;
  id?: string;
  requestId?: string;
  payload?: TPayload;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

当前内置消息：

- `suite:lifecycle:ready`
- `host:theme:update`
- `host:locale:update`
- `suite:notification:show`
- `suite:navigation:open`
- `suite:window:focus`

已占位但暂未实现运行逻辑的蓝图消息：

- `host:context:update`
- `host:permission:grant`
- `host:permission:deny`
- `suite:dialog:confirm`
- `suite:window:title:update`
- `suite:window:dirty:update`
- `suite:file:open`
- `suite:file:save`
- `suite:log:event`
- `suite:error:report`
- `suite:lifecycle:heartbeat`
- `suite:lifecycle:status`

## API

```ts
createSuiteBridge(options?: CreateSuiteBridgeOptions): SuiteBridge
createSuiteHostBridge(options: CreateSuiteHostBridgeOptions): SuiteHostBridge
```

声明 `window` capability 后，套件 SDK 会在套件内 `pointerdown` 和 `focusin` 时自动发送 `suite:window:focus`，主控可据此聚焦承载窗口。特殊场景也可以调用 `bridge.requestWindowFocus()` 手动请求聚焦。

声明 `notification` capability 后，套件可以调用 `bridge.notify(payload)` 请求主控展示统一通知。该方法返回布尔值，便于套件在独立运行时切回本地通知。

声明 `navigation` capability 后，套件可以调用 `bridge.navigate(payload)` 请求主控执行导航动作。该方法返回布尔值，便于套件在独立运行时使用本地窗口、链接或提示降级。
