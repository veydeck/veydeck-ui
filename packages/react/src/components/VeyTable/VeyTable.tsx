import React from "react";
import { VeyCheckbox } from "../VeyCheckbox/VeyCheckbox";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyTable.css";

export interface VeyTableColumn<T = any> {
  prop?: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  slot?: string;
  headerSlot?: string;
  renderCell?: (
    row: T,
    column: VeyTableColumn<T>,
    index: number,
  ) => React.ReactNode;
  renderHeader?: (column: VeyTableColumn<T>, index: number) => React.ReactNode;
  fixed?: "left" | "right";
}

export interface VeyTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  /** 表格数据 */
  data: T[];
  /** 列配置 */
  columns: VeyTableColumn<T>[];
  /** 是否显示全网格边框 */
  border?: boolean;
  /** 无数据时显示的占位文案 */
  emptyText?: string;
  rowKey?: keyof T | ((row: T) => React.Key);
  /** 插槽映射 (对应 Vue 中的 scoped slots) */
  slots?: Record<
    string,
    (scope: {
      row: T;
      column: VeyTableColumn<T>;
      index: number;
    }) => React.ReactNode
  >;
  /** 表头插槽映射 */
  headerSlots?: Record<
    string,
    (scope: { column: VeyTableColumn<T>; index: number }) => React.ReactNode
  >;
  /** 自定义空数据占位 */
  emptySlot?: React.ReactNode;
  /** 鼠标悬浮行回调 */
  onRowMouseEnter?: (
    row: T,
    event: React.MouseEvent<HTMLTableRowElement>,
    index: number,
  ) => void;
  /** 右键行回调 */
  onRowContextMenu?: (
    row: T,
    event: React.MouseEvent<HTMLTableRowElement>,
    index: number,
  ) => void;
  /** 是否显示内置选择列。 */
  selectable?: boolean;
  /** 当前选中的稳定行键。 */
  selectedRowKeys?: React.Key[];
  /** 更新受控选择状态。 */
  onSelectedRowKeysChange?: (keys: React.Key[]) => void;
  /** 选择状态变化回调。 */
  onSelectionChange?: (keys: React.Key[]) => void;
  /** 判断一行是否允许选择。 */
  rowSelectable?: (row: T, index: number) => boolean;
  /** 全选复选框的无障碍名称。 */
  selectAllLabel?: string;
  /** 行复选框的无障碍名称或计算函数。 */
  selectRowLabel?: string | ((row: T, index: number) => string);
  /** 选择列宽度。 */
  selectionColumnWidth?: number;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

const formatWidth = (width?: string | number) => {
  if (width === undefined) return undefined;
  return typeof width === "number" ? `${width}px` : width;
};

const getHeaderStyle = <T,>(col: VeyTableColumn<T>): React.CSSProperties => {
  return {
    width: formatWidth(col.width),
    minWidth: formatWidth(col.minWidth),
    textAlign: col.headerAlign || col.align || "center",
  };
};

const getCellStyle = <T,>(col: VeyTableColumn<T>): React.CSSProperties => {
  return {
    width: formatWidth(col.width),
    minWidth: formatWidth(col.minWidth),
    textAlign: col.align || "left",
  };
};

export function VeyTable<T extends Record<string, any>>({
  data,
  columns,
  border = false,
  emptyText = "暂无数据",
  rowKey,
  slots,
  headerSlots,
  emptySlot,
  onRowMouseEnter,
  onRowContextMenu,
  selectable = false,
  selectedRowKeys = [],
  onSelectedRowKeysChange,
  onSelectionChange,
  rowSelectable,
  selectAllLabel = "Select all rows on this page",
  selectRowLabel = "Select row",
  selectionColumnWidth = 48,
  glass,
  className = "",
  ...rest
}: VeyTableProps<T>) {
  const glassRef = useGlass<HTMLDivElement>(glass, "surface");
  const fixedOffset = (index: number, side: "left" | "right") => {
    const range =
      side === "left" ? columns.slice(0, index) : columns.slice(index + 1);
    const columnOffset = range
      .filter((column) => column.fixed === side)
      .reduce(
        (total, column) =>
          total + (typeof column.width === "number" ? column.width : 0),
        0,
      );
    return side === "left" && selectable
      ? columnOffset + selectionColumnWidth
      : columnOffset;
  };
  const columnStyle = (
    column: VeyTableColumn<T>,
    index: number,
    header = false,
  ): React.CSSProperties => {
    const base = header ? getHeaderStyle(column) : getCellStyle(column);
    return column.fixed
      ? {
          ...base,
          position: "sticky",
          [column.fixed]: fixedOffset(index, column.fixed),
        }
      : base;
  };
  const resolveRowKey = (row: T, index: number): React.Key =>
    typeof rowKey === "function"
      ? rowKey(row)
      : rowKey
        ? (row[rowKey] as React.Key)
        : index;
  const isRowSelectable = (row: T, index: number) =>
    rowSelectable?.(row, index) ?? true;
  const resolvedRows = data.map((row, index) => ({
    row,
    index,
    key: resolveRowKey(row, index),
  }));
  const selectableRows = resolvedRows.filter(({ row, index }) =>
    isRowSelectable(row, index),
  );
  const selectedKeySet = new Set(selectedRowKeys);
  const allPageRowsSelected =
    selectableRows.length > 0 &&
    selectableRows.every(({ key }) => selectedKeySet.has(key));
  const somePageRowsSelected =
    !allPageRowsSelected &&
    selectableRows.some(({ key }) => selectedKeySet.has(key));
  const resolveSelectRowLabel = (row: T, index: number) =>
    typeof selectRowLabel === "function"
      ? selectRowLabel(row, index)
      : selectRowLabel;
  const emitSelection = (keys: React.Key[]) => {
    onSelectedRowKeysChange?.(keys);
    onSelectionChange?.(keys);
  };
  const updateRowSelection = (row: T, index: number, selected: boolean) => {
    if (!isRowSelectable(row, index)) return;
    const next = new Set(selectedRowKeys);
    const key = resolveRowKey(row, index);
    if (selected) next.add(key);
    else next.delete(key);
    emitSelection([...next]);
  };
  const updatePageSelection = (selected: boolean) => {
    const next = new Set(selectedRowKeys);
    for (const { key } of selectableRows) {
      if (selected) next.add(key);
      else next.delete(key);
    }
    emitSelection([...next]);
  };
  return (
    <div
      ref={glassRef}
      className={`vl-table-container ${border ? "vl-table-border" : ""} ${className}`.trim()}
      data-native-context-menu="true"
      {...rest}
    >
      <div className="vl-table-wrapper">
        <table
          className={`vl-table ${data.length === 0 ? "is-empty" : ""}`.trim()}
        >
          <thead>
            <tr className="vl-table-header-row">
              {selectable && (
                <th
                  className="vl-table-header-cell vl-table-selection-cell is-fixed-left"
                  style={{
                    width: selectionColumnWidth,
                    minWidth: selectionColumnWidth,
                    left: 0,
                  }}
                  data-slot="selection-header"
                >
                  <div className="vl-cell vl-table-selection-control">
                    <VeyCheckbox
                      glass={glass}
                      checked={allPageRowsSelected}
                      indeterminate={somePageRowsSelected}
                      disabled={selectableRows.length === 0}
                      ariaLabel={selectAllLabel}
                      data-ui="table-select-all"
                      onChange={updatePageSelection}
                    />
                  </div>
                </th>
              )}
              {columns.map((col, index) => {
                const isFixed = col.fixed ? `is-fixed-${col.fixed}` : "";
                return (
                  <th
                    key={index}
                    className={`vl-table-header-cell ${isFixed}`.trim()}
                    style={columnStyle(col, index, true)}
                  >
                    <div className="vl-cell">
                      {col.renderHeader
                        ? col.renderHeader(col, index)
                        : col.headerSlot &&
                            headerSlots &&
                            headerSlots[col.headerSlot]
                          ? headerSlots[col.headerSlot]({ column: col, index })
                          : col.label}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={resolveRowKey(row, rowIndex)}
                  className={`vl-table-row ${
                    selectable &&
                    selectedKeySet.has(resolveRowKey(row, rowIndex))
                      ? "is-selected"
                      : ""
                  }`.trim()}
                  onMouseEnter={(event) =>
                    onRowMouseEnter?.(row, event, rowIndex)
                  }
                  onContextMenu={(event) =>
                    onRowContextMenu?.(row, event, rowIndex)
                  }
                >
                  {selectable && (
                    <td
                      className="vl-table-cell vl-table-selection-cell is-fixed-left"
                      style={{
                        width: selectionColumnWidth,
                        minWidth: selectionColumnWidth,
                        left: 0,
                      }}
                      data-slot="selection-cell"
                    >
                      <div className="vl-cell vl-table-selection-control">
                        <VeyCheckbox
                          glass={glass}
                          checked={selectedKeySet.has(
                            resolveRowKey(row, rowIndex),
                          )}
                          disabled={!isRowSelectable(row, rowIndex)}
                          ariaLabel={resolveSelectRowLabel(row, rowIndex)}
                          data-ui="table-row-selection"
                          onChange={(selected) =>
                            updateRowSelection(row, rowIndex, selected)
                          }
                        />
                      </div>
                    </td>
                  )}
                  {columns.map((col, colIndex) => {
                    const isFixed = col.fixed ? `is-fixed-${col.fixed}` : "";
                    return (
                      <td
                        key={colIndex}
                        className={`vl-table-cell ${isFixed}`.trim()}
                        style={columnStyle(col, colIndex)}
                      >
                        <div className="vl-cell">
                          {col.renderCell
                            ? col.renderCell(row, col, rowIndex)
                            : col.slot && slots && slots[col.slot]
                              ? slots[col.slot]({
                                  row,
                                  column: col,
                                  index: rowIndex,
                                })
                              : col.prop
                                ? String(row[col.prop] ?? "")
                                : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="vl-table-empty-cell"
                >
                  {emptySlot || (
                    <div className="vl-table-empty">{emptyText}</div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
