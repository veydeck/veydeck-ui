# 反馈组件

## Alert

- **适用**：页面内持续反馈；短暂全局反馈使用 Toast。
- **API**：标题、描述、类型、图标、可关闭和关闭标签/事件。
- **语义**：`role="alert"`；关闭按钮必须有可本地化名称。覆盖四种状态和窄屏长文案。

## Toast

- **适用**：操作结果和短暂系统通知；需要用户决策时不使用。
- **API**：toast 列表、关闭事件和关闭标签。
- **语义**：容器 `aria-live="polite"`，错误项为 alert，其余为 status；仅关闭按钮触发关闭。

## Loading

- **适用**：局部异步等待；不替代空状态或错误反馈。
- **API**：`loading`、`text`、`cover` 和内容。
- **语义**：宿主 `aria-busy`，遮罩为 live status；reduced-motion 下缩短动画。

## Empty

- **适用**：无数据或首次使用状态；加载中和请求失败不使用。
- **API**：`description`、`icon` 和扩展内容。纯展示，覆盖默认与自定义内容。

## Tooltip

- **适用**：补充简短说明；关键说明和交互内容不放入 Tooltip。
- **API**：`text`、`position`、`delay`、`disabled`，两端行为一致。
- **语义**：浮层 `role="tooltip"`，触发器通过 `aria-describedby` 关联；自动翻转并跟随滚动。

## Icon

- **适用**：统一 UI 图标；套件或应用入口图标不属于本组件。
- **API**：`name`、`namespace`、`size`、`label`、`decorative`。
- **语义**：装饰图标从可访问树隐藏；语义图标必须提供 label；非法名称回退到 fallback。
