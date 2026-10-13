# 操作组件

## Button

- **适用**：提交、确认、取消等明确命令；不用于页面导航或仅展示状态。
- **API**：`type`、`size`、`disabled`、`loading`；Vue 发出 `click`，React 使用 `onClick`；内容分别为默认 slot/`children`。
- **交互与语义**：渲染原生 `button`；禁用或加载时不可触发；键盘遵循原生 Enter/Space。
- **标准场景**：五种类型、三种尺寸、禁用、加载、带图标和窄屏长文案。

## ActionMenu

- **适用**：同一对象的多个次要操作；单一主操作应使用 Button。
- **API**：`actions`、`label`、`disabled`、`defaultIcon`；动作包含 `label`、`className`、`icon`、`disabled`、`tooltip`、`handler`，两端配置对象字段完全一致。
- **交互与语义**：触发器为 menu button，下拉为 `menu/menuitem`；Enter、Space、ArrowDown 打开，方向键/Home/End 移动，Escape 关闭并恢复焦点。
- **标准场景**：正常、禁用动作、视口上下边缘、祖先滚动和窄屏长选项。
- **框架差异**：无业务差异；Vue 属性使用短横线模板命名，React 使用 camelCase。
