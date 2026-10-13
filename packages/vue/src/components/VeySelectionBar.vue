<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeySelectionBar.vue
 * @description 为表格及列表的批量选择状态提供统一摘要和操作布局。
 */

import VeyButton from "./VeyButton.vue";

interface Props {
  glass?: VeyGlassValue;
  /** 已选择项目数量。 */
  count: number;
  /** 数量前的本地化说明，例如“已选择”。 */
  label: string;
  /** 清除选择按钮文案；不传时隐藏按钮。 */
  clearLabel?: string;
  /** 是否禁止清除选择。 */
  clearDisabled?: boolean;
  /** 整个选择栏的无障碍名称。 */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  clearDisabled: false,
});

const emit = defineEmits<{
  clear: [];
}>();
const vGlass = useGlass(() => props.glass, "control");
</script>

<template>
  <div v-glass class="vl-selection-bar" data-ui="selection-bar">
    <div
      class="vl-selection-summary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      :aria-label="ariaLabel"
      data-slot="selection-summary"
    >
      <span class="vl-selection-label">{{ label }}</span>
      <span class="vl-selection-count">{{ count }}</span>
    </div>
    <div class="vl-selection-actions" data-slot="selection-actions">
      <slot></slot>
      <VeyButton
        :glass="glass"
        v-if="clearLabel"
        :disabled="clearDisabled"
        data-ui="clear-selection"
        @click="emit('clear')"
      >
        {{ clearLabel }}
      </VeyButton>
    </div>
  </div>
</template>

<style scoped>
.vl-selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--vdl-space-3);
  min-height: 40px;
  box-sizing: border-box;
  padding: var(--vdl-space-2) var(--vdl-space-3);
  border: 1px solid var(--vdl-border-brand);
  border-radius: var(--vdl-radius-md);
  background-color: var(--vdl-bg-active);
  color: var(--vdl-text-primary);
}

.vl-selection-summary,
.vl-selection-actions {
  display: flex;
  align-items: center;
  gap: var(--vdl-space-2);
}

.vl-selection-label {
  color: var(--vdl-text-secondary);
  font-size: var(--vdl-font-body-sm);
  font-weight: 600;
}

.vl-selection-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  box-sizing: border-box;
  padding: 0 var(--vdl-space-2);
  border-radius: var(--vdl-radius-pill);
  background-color: var(--vdl-primary);
  color: var(--vdl-text-inverse);
  font-size: var(--vdl-font-caption);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .vl-selection-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .vl-selection-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
