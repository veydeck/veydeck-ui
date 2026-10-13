<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeyDescriptions.vue
 * @description Veydeck 平台自研详情列表组件，用于展示键值对数据。
 */

interface DescriptionItem {
  label: string;
  value?: string | number | boolean;
  slot?: string;
  span?: number;
}

interface Props {
  glass?: VeyGlassValue;
  /** 标题 */
  title?: string;
  /** 列表项配置 */
  items: DescriptionItem[];
  /** 原始数据对象 (用于插槽渲染) */
  data?: Record<string, unknown>;
  /** 列数 */
  column?: number;
  /** 是否显示边框 */
  border?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  column: 1,
  border: false,
});
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <div class="vl-descriptions" :class="{ 'is-border': border }">
    <div v-if="title" class="vl-descriptions-title">{{ title }}</div>
    <div
      v-glass
      class="vl-descriptions-grid"
      :style="{ gridTemplateColumns: `repeat(${column}, 1fr)` }"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="vl-descriptions-item"
        :style="{ gridColumn: `span ${item.span || 1}` }"
      >
        <div class="vl-descriptions-label">{{ item.label }}</div>
        <div class="vl-descriptions-content">
          <slot
            v-if="item.slot"
            :name="item.slot"
            :item="item"
            :data="data"
          ></slot>
          <template v-else>
            {{ item.value ?? (data && item.label ? data[item.label] : "--") }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vl-descriptions {
  width: 100%;
  font-family: var(--vdl-font-family);
}

.vl-descriptions-title {
  margin-bottom: var(--vdl-space-3);
  font-size: var(--vdl-font-subtitle);
  font-weight: 600;
  color: var(--vdl-text-primary);
}

.vl-descriptions-grid {
  display: grid;
  gap: 0;
  width: 100%;
}

.vl-descriptions-item {
  display: flex;
  min-height: 40px;
  border-bottom: 1px solid var(--vdl-border-subtle);
}

.vl-descriptions-label {
  width: 140px;
  padding: var(--vdl-space-2) var(--vdl-space-4);
  background-color: var(--vdl-bg-muted);
  color: var(--vdl-text-secondary);
  font-size: var(--vdl-font-body-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.vl-descriptions-content {
  flex: 1;
  padding: var(--vdl-space-2) var(--vdl-space-4);
  color: var(--vdl-text-primary);
  font-size: var(--vdl-font-body-sm);
  display: flex;
  align-items: center;
  min-width: 0;
  word-break: break-all;
}

/* 边框模式 */
.is-border {
  border: 1px solid var(--vdl-border-default);
  border-bottom: none;
  border-radius: var(--vdl-radius-md);
  overflow: hidden;
}

.is-border .vl-descriptions-label {
  border-right: 1px solid var(--vdl-border-subtle);
}
</style>
