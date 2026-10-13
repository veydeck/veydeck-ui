# Veydeck UI

`veydeck-ui` 是 Veydeck Design Language、通用图标、基础组件和套件集成 SDK 的工作区。主控、API 治理库和官方套件通过该仓库共享一致的视觉语言与交互基础。

## 包结构

| 包                   | 说明                                         |
| -------------------- | -------------------------------------------- |
| `@veydeck/tokens`    | VDL 主题变量、颜色、间距、圆角、阴影和层级。 |
| `@veydeck/icons`     | SVG 图标、命名空间图标表和兜底图标。         |
| `@veydeck/vue`       | Vue 3 基础组件库。                           |
| `@veydeck/react`     | React 19 基础组件库。                        |
| `@veydeck/suite-sdk` | 套件 iframe 与主控通信 SDK。                 |

辅助项目：

| 目录                | 说明                   |
| ------------------- | ---------------------- |
| `playground/`       | Vue 组件预览。         |
| `playground-react/` | React 组件预览。       |
| `scripts/`          | 包检查和发布辅助脚本。 |

## 开发命令

```bash
pnpm install
pnpm build
pnpm dev
pnpm dev:react
pnpm check
pnpm build
pnpm test:e2e
```

Playground 使用工作区包的 `dist` 构建产物，首次启动前以及修改组件库源码后需执行 `pnpm build`。

## 文档与测试

- [组件契约](./docs/components/README.md)
- [Liquid Glass 共享契约](./docs/components/liquid-glass.md)
- [贡献指南](./CONTRIBUTING.md)
- `pnpm format:check`：检查代码格式，不改写文件。
- `pnpm check`：格式、类型、构建、单元测试、消费者构建和包归档检查。
- `pnpm test:e2e`：运行 Chromium 行为与视觉回归测试。
- `pnpm test:e2e:update`：人工确认视觉变更后更新截图基线。

Pull Request 和 `main` 分支推送必须通过完整质量检查；软件包发布前还会重复执行非浏览器检查。

单包构建：

```bash
pnpm --filter @veydeck/icons build
pnpm --filter @veydeck/vue build
pnpm --filter @veydeck/react build
```

## 使用示例

样式入口：

```css
@import "@veydeck/tokens/index.css";
```

Vue：

```vue
<script setup lang="ts">
import { VeyButton, VeyIcon } from "@veydeck/vue";
</script>

<template>
  <VeyButton type="primary">
    <VeyIcon name="settings" :size="16" />
    设置
  </VeyButton>
</template>
```

React：

```tsx
import { VeyButton, VeyIcon } from "@veydeck/react";

export function SettingsButton() {
  return (
    <VeyButton type="primary">
      <VeyIcon name="settings" size={16} />
      设置
    </VeyButton>
  );
}
```
