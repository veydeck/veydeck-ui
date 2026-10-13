# 容器组件

## Card

- **适用**：单个重复实体或明确框定工具；不用于嵌套页面分区。
- **API**：`shadow`、内容样式、内容角色、`fullHeight`、header/default 内容。
- **行为**：纯布局容器；覆盖有无标题、无阴影和全高状态。

## Dialog

- **适用**：需要上下文确认或编辑的居中任务；复杂长流程应使用独立页面。
- **API**：可见状态、`title`、`width`、overlay 关闭、`zIndex`、footer 和关闭事件。
- **语义**：`role="dialog"`、标题关联、焦点陷阱、Escape、焦点恢复和嵌套滚动锁。
- **映射**：Vue `visible`/`close`；React `visible`/`onClose`。

## Drawer

- **适用**：不离开当前页面的侧边详情或配置；关键确认不使用。
- **API**：可见状态、`title`、`width`、overlay 关闭、footer 和关闭事件。
- **语义**：与 Dialog 相同的焦点及滚动规则；窄屏宽度受视口约束。
- **映射**：Vue `modelValue`；React `visible`。

## Modal

- **适用**：简短确认、警告或破坏性操作；复杂自定义内容使用 Dialog。
- **API**：可见状态、标题、消息、按钮文案、类型及确认/取消事件。
- **语义**：`alertdialog`、标题关联、焦点陷阱、Escape 视为取消、关闭后恢复焦点。
