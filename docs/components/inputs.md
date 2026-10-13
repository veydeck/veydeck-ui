# 输入与表单组件

## Input

- **适用**：文本、密码、数字、日期时间和多行文本；枚举值应使用 Select。
- **API**：值、`type`、`placeholder`、`disabled`、只读、长度/数值范围、`invalid`、输入 ID 与描述关联。Vue 使用 `readonly/maxlength/autocomplete`，React 遵循 DOM 属性使用 `readOnly/maxLength/autoComplete`，不提供重复别名。
- **交互与语义**：使用原生 input/textarea；数字模式输出 `number | null`；密码切换为具名按钮。
- **映射**：Vue `modelValue`；React `value`。两端均为必填受控值；标准场景覆盖正常、禁用、只读、错误、密码和数字空值。

## Select

- **适用**：有限单选项；大量层级数据或自由输入不使用此组件。
- **API**：值、`options`、`placeholder`、`disabled`、滚动/触底事件和 footer。
- **交互与语义**：`combobox/listbox/option`；方向键/Home/End、Enter/Space、Escape；自动翻转并限制在视口内。
- **映射**：Vue footer slot 与事件；React `dropdownFooter` 与回调。覆盖禁用项、长选项、分页加载和窄屏。

## Switch

- **适用**：立即生效的二元设置；需要批量提交的选择使用 Checkbox。
- **API**：值、`activeText`、`disabled`；变化事件两端对应。
- **语义**：原生 button + `role="switch"`、`aria-checked`，支持 Enter/Space。
- **受控值**：Vue `modelValue`、React `value` 均为必填，变化分别通过 `update:modelValue/change` 与 `onChange` 返回。

## Checkbox

- **适用**：独立选择或多选集合；互斥选择不使用。
- **API**：布尔值、`disabled`、`indeterminate` 和变化事件。
- **语义**：原生 checkbox；不确定状态使用 DOM `indeterminate` 和 `aria-checked="mixed"`。
- **受控值**：Vue `modelValue`、React `checked` 均为必填。

## DateTimeRangePicker

- **适用**：日志、审计、指标等起止时间范围；单一日期不使用。
- **API**：`startAt/endAt`、本地化标签、`locale`、`weekDays`、`shortcuts`、`disabled` 和应用事件。
- **交互与语义**：触发器打开视口自适应浮层；清除、取消不提交，确认后提交完整范围。
- **受控值**：Vue `modelValue` 与 React `value` 均为必填。
- **映射**：Vue `modelValue`/`apply`；React `value`/`onChange`。覆盖空值、快捷范围、自定义时间、窄屏和边缘翻转。

## FormItem

- **适用**：统一表单标签、提示和错误；不承载业务校验逻辑。
- **API**：`label`、`required`、`hint`、`error`、control ID 和 hint ID。
- **语义**：label 与控件关联，hint/error 通过描述 ID 关联，错误使用 live alert。
- **映射**：Vue `for`；React `htmlFor`。标准场景覆盖普通、必填、提示和错误。
