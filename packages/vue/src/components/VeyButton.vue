<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeyButton.vue
 * @description Veydeck 平台自研按钮组件，严格遵循 VDL 设计规范。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 按钮类型 */
  type?: "primary" | "secondary" | "danger" | "warning" | "info";
  /** 按钮尺寸 */
  size?: "small" | "default" | "large";
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  type: "secondary",
  size: "default",
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

function handleClick(event: MouseEvent) {
  emit("click", event);
}
const vGlass = useGlass(() => props.glass, "control");
</script>

<template>
  <button
    v-glass
    class="vl-button"
    :class="[
      `vl-button--${type}`,
      `vl-button--${size}`,
      { 'is-loading': loading },
    ]"
    :disabled="disabled || loading"
    type="button"
    @click="handleClick"
  >
    <span v-if="loading" class="vl-button-loading-icon">
      <svg class="vl-spinner" viewBox="0 0 50 50">
        <circle
          class="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="5"
        ></circle>
      </svg>
    </span>
    <span class="vl-button-content">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.vl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: none;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--vdl-font-family);
}

.vl-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 尺寸预设 */
.vl-button--default {
  height: 32px;
  padding: 0 var(--vdl-space-3);
  font-size: var(--vdl-font-body-sm);
  border-radius: var(--vdl-radius-md);
}

.vl-button--small {
  height: 24px;
  padding: 0 var(--vdl-space-2);
  font-size: var(--vdl-font-caption);
  border-radius: var(--vdl-radius-sm);
}

.vl-button--large {
  height: 40px;
  padding: 0 var(--vdl-space-5);
  font-size: var(--vdl-font-body);
  border-radius: var(--vdl-radius-md);
}

/* 类型预设 */
.vl-button--primary {
  background-color: var(--vdl-primary);
  border-color: var(--vdl-primary);
  color: var(--vdl-text-inverse);
}
.vl-button--primary:not(:disabled):hover {
  background-color: var(--vdl-primary-hover);
  border-color: var(--vdl-primary-hover);
  box-shadow: 0 4px 12px rgba(0, 200, 255, 0.25);
}
.vl-button--primary:not(:disabled):active {
  background-color: var(--vdl-primary-active);
  border-color: var(--vdl-primary-active);
}

.vl-button--secondary {
  background-color: var(--vdl-bg-muted);
  border-color: var(--vdl-border-default);
  color: var(--vdl-text-secondary);
}
.vl-button--secondary:not(:disabled):hover {
  background-color: var(--vdl-bg-hover);
  border-color: var(--vdl-border-brand);
  color: var(--vdl-text-primary);
}

.vl-button--danger {
  background-color: var(--vdl-danger);
  border-color: var(--vdl-danger);
  color: var(--vdl-text-on-danger);
}
.vl-button--danger:not(:disabled):hover {
  opacity: 0.9;
  filter: brightness(1.1);
}

.vl-button--warning {
  background-color: var(--vdl-warning);
  border-color: var(--vdl-warning);
  color: var(--vdl-text-inverse);
}

.vl-button--info {
  background-color: rgba(145, 162, 184, 0.1);
  border-color: rgba(145, 162, 184, 0.2);
  color: var(--vdl-text-muted);
}
.vl-button--info:not(:disabled):hover {
  background-color: rgba(145, 162, 184, 0.2);
  color: var(--vdl-text-secondary);
}

/* 加载动画 */
.vl-button-loading-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.vl-spinner {
  animation: rotate 2s linear infinite;
  width: 14px;
  height: 14px;
}

.vl-spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
