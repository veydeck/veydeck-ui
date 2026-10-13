# 数据组件

## Table

- **适用**：结构化行列数据；卡片流或超大虚拟数据集不使用。
- **API**：`data`、`columns`、`border`、`emptyText`、`rowKey`、单元格/表头渲染和行事件。
- **行为**：`rowKey` 必须稳定；多个左右固定列累计偏移；容器负责横向滚动。
- **映射**：Vue scoped slots；React render/slots 回调。覆盖空态、重排、多个固定列和 320px 容器。

## Pagination

- **适用**：已知总页数的数据分页；无限滚动不使用。
- **API**：`currentPage`、`totalPages`、`maxVisibleButtons` 和本地化无障碍标签。
- **语义**：`nav` 与原生按钮，当前页使用 `aria-current="page"`；边界按钮禁用。
- **映射**：Vue `page-change`；React `onPageChange`。

## Tag

- **适用**：紧凑状态、分类和属性；可点击操作不使用。
- **API**：`type`、`effect` 和内容。
- **行为**：纯展示，无焦点和点击语义；覆盖全部状态和三种效果。

## Descriptions

- **适用**：对象详情键值展示；可编辑数据应使用表单。
- **API**：`title`、`items`、`data`、`column`、`border` 和自定义值渲染。
- **行为**：按列布局，窄屏不得造成页面级溢出；布尔值和零值必须正常展示。
- **映射**：Vue named slots；React `slots` 回调。
