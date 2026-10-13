<script setup lang="ts" generic="T extends Record<string, any>">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeyTable.vue
 * @description Veydeck 平台自研表格组件，严格遵循 VDL 设计规范。
 * 支持数据驱动列配置、自定义插槽渲染、固定列以及全网格边框。
 */

import { computed } from "vue";
import type { CSSProperties } from "vue";
import VeyCheckbox from "./VeyCheckbox.vue";

export type VeyTableRowKey = string | number;

export interface VeyTableColumn {
  prop?: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  slot?: string;
  headerSlot?: string;
  fixed?: "left" | "right";
}

const props = withDefaults(
  defineProps<{
    glass?: VeyGlassValue;
    /** 表格数据 */
    data: T[];
    /** 列配置 */
    columns: VeyTableColumn[];
    /** 是否显示全网格边框 */
    border?: boolean;
    /** 无数据时显示的占位文案 */
    emptyText?: string;
    /** 稳定行键字段或计算函数。 */
    rowKey?: string | ((row: T) => VeyTableRowKey);
    /** 是否显示内置选择列。 */
    selectable?: boolean;
    /** 当前选中的稳定行键。 */
    selectedRowKeys?: VeyTableRowKey[];
    /** 判断一行是否允许选择。 */
    rowSelectable?: (row: T, index: number) => boolean;
    /** 全选复选框的无障碍名称。 */
    selectAllLabel?: string;
    /** 行复选框的无障碍名称或计算函数。 */
    selectRowLabel?: string | ((row: T, index: number) => string);
    /** 选择列宽度。 */
    selectionColumnWidth?: number;
  }>(),
  {
    glass: undefined,
    border: false,
    emptyText: "暂无数据",
    selectable: false,
    selectedRowKeys: () => [],
    selectAllLabel: "Select all rows on this page",
    selectRowLabel: "Select row",
    selectionColumnWidth: 48,
  },
);

const emit = defineEmits<{
  rowMouseenter: [row: T, event: MouseEvent, index: number];
  rowContextmenu: [row: T, event: MouseEvent, index: number];
  "update:selectedRowKeys": [keys: VeyTableRowKey[]];
  selectionChange: [keys: VeyTableRowKey[]];
}>();

const selectedKeySet = computed(() => new Set(props.selectedRowKeys));
const selectableRows = computed(() =>
  props.data
    .map((row, index) => ({ row, index, key: resolveRowKey(row, index) }))
    .filter(({ row, index }) => isRowSelectable(row, index)),
);
const allPageRowsSelected = computed(
  () =>
    selectableRows.value.length > 0 &&
    selectableRows.value.every(({ key }) => selectedKeySet.value.has(key)),
);
const somePageRowsSelected = computed(
  () =>
    !allPageRowsSelected.value &&
    selectableRows.value.some(({ key }) => selectedKeySet.value.has(key)),
);

/**
 * 格式化宽度数值
 */
function formatWidth(width?: string | number) {
  if (width === undefined) return undefined;
  return typeof width === "number" ? `${width}px` : width;
}

/**
 * 获取表头单元格的样式
 */
function getHeaderStyle(col: VeyTableColumn) {
  return {
    width: formatWidth(col.width),
    minWidth: formatWidth(col.minWidth),
    textAlign: col.headerAlign || col.align || "center", // 默认表头居中
  };
}

/**
 * 获取数据单元格的样式
 */
function getCellStyle(col: VeyTableColumn) {
  return {
    width: formatWidth(col.width),
    minWidth: formatWidth(col.minWidth),
    textAlign: col.align || "left", // 默认内容居左
  };
}
function fixedOffset(index: number, side: "left" | "right") {
  const range =
    side === "left"
      ? props.columns.slice(0, index)
      : props.columns.slice(index + 1);
  const columnOffset = range
    .filter((column) => column.fixed === side)
    .reduce(
      (total, column) =>
        total + (typeof column.width === "number" ? column.width : 0),
      0,
    );
  return side === "left" && props.selectable
    ? columnOffset + props.selectionColumnWidth
    : columnOffset;
}
function getColumnStyle(
  col: VeyTableColumn,
  index: number,
  header = false,
): CSSProperties {
  const base = header ? getHeaderStyle(col) : getCellStyle(col);
  return col.fixed
    ? {
        ...base,
        position: "sticky",
        [col.fixed]: `${fixedOffset(index, col.fixed)}px`,
      }
    : base;
}
function resolveRowKey(row: T, index: number) {
  if (typeof props.rowKey === "function") return props.rowKey(row);
  if (props.rowKey) return row[props.rowKey];
  return index;
}

/** 判断指定行是否允许选择。 */
function isRowSelectable(row: T, index: number) {
  return props.rowSelectable?.(row, index) ?? true;
}

/** 生成行选择控件的无障碍名称。 */
function resolveSelectRowLabel(row: T, index: number) {
  return typeof props.selectRowLabel === "function"
    ? props.selectRowLabel(row, index)
    : props.selectRowLabel;
}

/** 发出受控选择状态更新。 */
function updateSelection(keys: VeyTableRowKey[]) {
  emit("update:selectedRowKeys", keys);
  emit("selectionChange", keys);
}

/** 更新单行选择状态。 */
function updateRowSelection(row: T, index: number, selected: boolean) {
  if (!isRowSelectable(row, index)) return;
  const key = resolveRowKey(row, index);
  const next = new Set(props.selectedRowKeys);
  if (selected) next.add(key);
  else next.delete(key);
  updateSelection([...next]);
}

/** 选择或取消选择当前页全部可选行，同时保留其他页面的选择。 */
function updatePageSelection(selected: boolean) {
  const next = new Set(props.selectedRowKeys);
  for (const { key } of selectableRows.value) {
    if (selected) next.add(key);
    else next.delete(key);
  }
  updateSelection([...next]);
}
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <div
    v-glass
    class="vl-table-container"
    :class="{ 'vl-table-border': border }"
    data-native-context-menu
  >
    <div class="vl-table-wrapper">
      <table class="vl-table" :class="{ 'is-empty': data.length === 0 }">
        <thead>
          <tr class="vl-table-header-row">
            <th
              v-if="selectable"
              class="vl-table-header-cell vl-table-selection-cell is-fixed-left"
              :style="{
                width: `${selectionColumnWidth}px`,
                minWidth: `${selectionColumnWidth}px`,
                left: '0',
              }"
              data-slot="selection-header"
            >
              <div class="vl-cell vl-table-selection-control">
                <VeyCheckbox
                  :glass="glass"
                  :model-value="allPageRowsSelected"
                  :indeterminate="somePageRowsSelected"
                  :disabled="selectableRows.length === 0"
                  :aria-label="selectAllLabel"
                  data-ui="table-select-all"
                  @change="updatePageSelection"
                />
              </div>
            </th>
            <th
              v-for="(col, index) in columns"
              :key="index"
              class="vl-table-header-cell"
              :class="[col.fixed ? `is-fixed-${col.fixed}` : '']"
              :style="getColumnStyle(col, index, true)"
            >
              <div class="vl-cell">
                <!-- 如果配置了表头插槽且传入了插槽内容 -->
                <slot
                  v-if="col.headerSlot && $slots[col.headerSlot]"
                  :name="col.headerSlot"
                  v-bind="{ column: col, index, row: undefined as any }"
                ></slot>
                <template v-else>
                  {{ col.label }}
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="data.length > 0">
            <tr
              v-for="(row, rowIndex) in data"
              :key="resolveRowKey(row, rowIndex)"
              class="vl-table-row"
              :class="{
                'is-selected':
                  selectable &&
                  selectedKeySet.has(resolveRowKey(row, rowIndex)),
              }"
              @mouseenter="
                (event) => emit('rowMouseenter', row, event, rowIndex)
              "
              @contextmenu="
                (event) => emit('rowContextmenu', row, event, rowIndex)
              "
            >
              <td
                v-if="selectable"
                class="vl-table-cell vl-table-selection-cell is-fixed-left"
                :style="{
                  width: `${selectionColumnWidth}px`,
                  minWidth: `${selectionColumnWidth}px`,
                  left: '0',
                }"
                data-slot="selection-cell"
              >
                <div class="vl-cell vl-table-selection-control">
                  <VeyCheckbox
                    :glass="glass"
                    :model-value="
                      selectedKeySet.has(resolveRowKey(row, rowIndex))
                    "
                    :disabled="!isRowSelectable(row, rowIndex)"
                    :aria-label="resolveSelectRowLabel(row, rowIndex)"
                    data-ui="table-row-selection"
                    @change="
                      (selected) => updateRowSelection(row, rowIndex, selected)
                    "
                  />
                </div>
              </td>
              <td
                v-for="(col, colIndex) in columns"
                :key="colIndex"
                class="vl-table-cell"
                :class="[col.fixed ? `is-fixed-${col.fixed}` : '']"
                :style="getColumnStyle(col, colIndex)"
              >
                <div class="vl-cell">
                  <!-- 如果配置了插槽且传入了插槽内容 -->
                  <slot
                    v-if="col.slot && $slots[col.slot]"
                    :name="col.slot"
                    v-bind="{ row, column: col, index: rowIndex }"
                  ></slot>
                  <!-- 否则渲染普通的 prop 数据 -->
                  <template v-else>
                    {{ col.prop ? row[col.prop] : "" }}
                  </template>
                </div>
              </td>
            </tr>
          </template>
          <!-- 空状态 -->
          <tr v-else>
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="vl-table-empty-cell"
            >
              <slot name="empty">
                <div class="vl-table-empty">{{ emptyText }}</div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.vl-table-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: var(--vdl-radius-md);
}

.vl-table-wrapper {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.vl-table {
  width: 100%;
  min-width: max-content;
  border-spacing: 0;
  border-collapse: separate;
  table-layout: auto;
}

.vl-table.is-empty {
  height: 100%;
}

.vl-table.is-empty tbody,
.vl-table.is-empty tbody > tr {
  height: 100%;
}

/* 表头样式 */
.vl-table-header-cell {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--vdl-bg-muted);
  color: var(--vdl-text-primary);
  font-size: var(--vdl-font-body-sm);
  font-weight: 600;
  padding: var(--vdl-space-3) 0;
  border-bottom: 1px solid var(--vdl-border-default);
  white-space: nowrap;
  user-select: none;
}

/* 单元格通用样式 */
.vl-table-cell {
  background-color: var(--vdl-bg-base);
  color: var(--vdl-text-primary);
  font-size: var(--vdl-font-body-sm);
  font-weight: 500;
  padding: var(--vdl-space-2) 0;
  border-bottom: 1px solid var(--vdl-border-default);
  transition: background-color 0.2s;
}

.vl-table-row.is-selected .vl-table-cell {
  background-color: var(--vdl-bg-active);
}

.vl-cell {
  padding: 0 var(--vdl-space-3);
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 23px;
}

.vl-table-selection-cell {
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 0;
}

.vl-table-selection-control {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

/* 边框模式样式 */
.vl-table-border {
  border: 1px solid var(--vdl-border-default);
}

.vl-table-border .vl-table-header-cell,
.vl-table-border .vl-table-cell {
  border-right: 1px solid var(--vdl-border-default);
}

.vl-table-border .vl-table-header-cell:last-child,
.vl-table-border .vl-table-cell:last-child {
  border-right: none;
}

/* 固定列实现 (简单版) */
.is-fixed-right {
  position: sticky;
  right: 0;
  z-index: 20;
}
.is-fixed-left {
  position: sticky;
  left: 0;
  z-index: 20;
}
.vl-table-cell.is-fixed-left,
.vl-table-cell.is-fixed-right {
  /* 固定列需要与普通单元格使用相同的不透明衬底。 */
  background-color: var(--vdl-bg-base);
}
.vl-table-header-cell.is-fixed-left {
  z-index: 30;
  background-color: var(--vdl-bg-muted);
}

/* 如果表头也有固定列，层级需要更高 */
.vl-table-header-cell.is-fixed-right {
  z-index: 30;
  background-color: var(--vdl-bg-muted);
}

/* 空状态样式 */
.vl-table-empty-cell {
  height: 100%;
  padding: var(--vdl-space-8) 0;
  text-align: center;
}

.vl-table-empty {
  color: var(--vdl-text-muted);
  font-size: var(--vdl-font-body-sm);
}
</style>
