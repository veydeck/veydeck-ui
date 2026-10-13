# 导航组件

## Tabs

- **适用**：同一上下文中的并列视图；跨页面导航不使用。
- **API**：当前值、`tabs` 和单一变化事件。Vue 使用必填 `modelValue`、`update:modelValue/change`；React 使用必填 `value`、`onChange`。
- **语义**：tablist/tab、`aria-selected`、roving tabindex；方向键/Home/End 切换并跳过禁用项。

## Menu

- **适用**：应用或设置区域导航；对象操作集合使用 ActionMenu。
- **API**：当前值、分组 items、变化事件和导航标签。Vue 使用必填 `modelValue`、`update:modelValue/change`；React 使用必填 `value`、`onChange`。
- **语义**：`nav` + 原生按钮，当前项 `aria-current="page"`；方向键/Home/End 移动焦点。

## Breadcrumb

- **适用**：展示当前位置层级；不替代主导航。
- **API**：`separator` 和子项；允许自动分隔。
- **语义**：有名称的 breadcrumb navigation，最后一项表示当前位置。

## BreadcrumbItem

- **适用**：仅作为 Breadcrumb 子项。
- **API**：内容及可选链接/点击能力以公开类型为准。
- **语义**：可导航项使用原生链接或按钮；当前项不伪装为可点击控件。
