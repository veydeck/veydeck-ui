<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import type { CSSProperties } from "vue";

/**
 * @file VeyCard.vue
 * @description Veydeck 平台自研卡片组件，严格遵循 VDL 设计规范。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 阴影显示时机 */
  shadow?: "always" | "hover" | "never";
  /** 内容区自定义样式 */
  contentStyle?: CSSProperties;
  /** 默认插槽容器语义 */
  contentRole?: "content" | "header";
  /** 内容区是否撑满高度 (用于包含滚动表格的场景) */
  fullHeight?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  shadow: "always",
  contentRole: "content",
  fullHeight: false,
});
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <div
    v-glass
    class="vl-card"
    :class="[`is-shadow-${shadow}`, { 'is-full-height': fullHeight }]"
  >
    <div v-if="$slots.header" class="vl-card-header">
      <slot name="header"></slot>
    </div>
    <div
      :class="[
        contentRole === 'header' ? 'vl-card-header' : 'vl-card-content',
        { 'is-full-height': fullHeight },
      ]"
      :style="contentStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.vl-card {
  border-radius: var(--vdl-radius-lg);
  border: 1px solid var(--vdl-border-default);
  background-color: var(--vdl-bg-card);
  color: var(--vdl-text-primary);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.vl-card-header {
  padding: var(--vdl-space-4);
  border-bottom: 1px solid var(--vdl-border-subtle);
  background-color: var(--vdl-bg-muted);
  flex-shrink: 0;
}

.vl-card-content {
  padding: var(--vdl-space-4);
  flex: 1;
  min-height: 0;
}

.vl-card-content.is-full-height {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.vl-card.is-full-height {
  height: 100%;
}

/* 阴影效果 */
.is-shadow-always {
  box-shadow: var(--vdl-shadow-panel);
}

.is-shadow-hover:hover {
  box-shadow: var(--vdl-shadow-panel);
  border-color: var(--vdl-border-brand);
}

.is-shadow-never {
  box-shadow: none;
}
</style>
