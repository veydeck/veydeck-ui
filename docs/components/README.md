# 组件契约

本目录是 `@veydeck/vue` 与 `@veydeck/react` 的共享行为契约。公开类型仍以发布包 TypeScript 声明为准；本文档约束组件用途、交互语义和跨框架一致性。

[Liquid Glass](./liquid-glass.md) 定义 Vue 与 React 共用的材质接口、生效范围、降级行为和验证要求；原有业务交互契约继续适用。

| 分类                    | 组件                                                           |
| ----------------------- | -------------------------------------------------------------- |
| [操作](./actions.md)    | Button、ActionMenu                                             |
| [输入](./inputs.md)     | Input、Select、Switch、Checkbox、DateTimeRangePicker、FormItem |
| [数据](./data.md)       | Table、Pagination、Tag、Descriptions                           |
| [容器](./containers.md) | Card、Dialog、Drawer、Modal                                    |
| [反馈](./feedback.md)   | Alert、Toast、Loading、Empty、Tooltip、Icon                    |
| [导航](./navigation.md) | Tabs、Menu、Breadcrumb、BreadcrumbItem                         |

## 跨框架约定

- 同一组件的业务语义、必填性、默认值和数据类型必须一致，不保留无意义的兼容别名。
- Vue 使用 `modelValue` / `update:modelValue`，React 使用 `value` / `onChange`；Checkbox 在 React 使用原生语义 `checked`。
- Vue 自定义内容使用 slot；React 使用 `children`、render 属性或对应回调。
- Vue 使用 `for` 和模板属性名，React 使用 `htmlFor` 及 `readOnly/maxLength/autoComplete` 等 DOM 驼峰属性。
- Vue 使用 `class`，React 使用 `className`；传入配置对象等非模板上下文的数据字段必须使用共享契约规定的同一名称。
- 交互组件的键盘路径、禁用行为、ARIA 语义和视觉状态必须一致。
- 默认场景同时验证正常、禁用、错误、加载和 320px 窄屏状态；高风险浮层还需验证视口边缘和祖先滚动。
