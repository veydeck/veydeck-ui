# @veydeck/icons

Veydeck 自有 SVG 图标包，包含通用界面图标和紧凑场景使用的应用语义图标。

## 安装

```bash
pnpm add @veydeck/icons
```

## 使用

按名称读取通用 SVG 字符串：

```ts
import { getIcon } from "@veydeck/icons";

const settingsIcon = getIcon("settings");
```

读取应用命名空间中的 SVG：

```ts
const appSettingsIcon = getIcon("settings", "apps");
```

也可以按命名空间读取完整图标映射：

```ts
import { iconMap } from "@veydeck/icons";

const commonNames = Object.keys(iconMap.common);
const appNames = Object.keys(iconMap.apps);
```

不存在的名称会回退到 `common/fallback` 图标。

Vue 项目通常应使用 `@veydeck/vue` 提供的 `VeyIcon`：

```vue
<VeyIcon name="settings" />
<VeyIcon name="settings" namespace="apps" />
```

## 命名与设计

- 文件名使用小写字母、数字和连字符。
- 通用图标名称表达动作或对象，例如 `search`、`download`、`server`。
- 应用图标名称与应用 ID 保持一致。
- SVG 使用 `24x24` 画布、`currentColor` 和统一的圆角描边。
- 不使用 Emoji、字体图标、Base64 图片或外部图标资源。
- `common` 用于按钮、菜单、状态和数据展示。
- `apps` 用于窗口标题、通知来源、菜单和空状态等紧凑应用语义场景。
- 应用库、桌面、任务栏和套件入口使用各项目维护的 PNG 资产。

## 新增图标

通用图标放入 `src/svgs/common/`，应用语义图标放入 `src/svgs/apps/`。`fallback.svg` 只允许存在于 `common/`。新增后执行仓库图标校验和完整检查：

```bash
node .agents/skills/veydeck-icon-system/scripts/validate-icons.mjs packages/icons/src/svgs/common
node .agents/skills/veydeck-icon-system/scripts/validate-icons.mjs packages/icons/src/svgs/apps
pnpm check
```
