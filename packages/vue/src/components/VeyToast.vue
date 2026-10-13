<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeyToast.vue
 * @description Veydeck 平台自研通知提示组件，支持多种类型和自动消失。
 * 注意：此组件通常配合 ToastStore 使用，直接渲染列表。
 */

import VeyIcon from "./VeyIcon.vue";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

const props = withDefaults(
  defineProps<{
    glass?: VeyGlassValue;
    /** 通知列表 */
    toasts: ToastItem[];
    /** 关闭按钮的无障碍标签 */
    closeLabel?: string;
  }>(),
  { glass: undefined },
);

const emit = defineEmits<{
  (e: "close", id: string): void;
}>();

function toastIcon(type: ToastItem["type"]) {
  if (type === "success") return "success";
  if (type === "error") return "error";
  if (type === "warning") return "warning";
  return "info";
}
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <Teleport to="body">
    <div
      class="vl-toast-container"
      aria-live="polite"
      aria-relevant="additions"
    >
      <TransitionGroup name="vl-toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          v-glass
          class="vl-toast-item"
          :class="[`is-${toast.type}`]"
          :role="toast.type === 'error' ? 'alert' : 'status'"
        >
          <div class="vl-toast-icon">
            <VeyIcon :name="toastIcon(toast.type)" :size="20" />
          </div>
          <div class="vl-toast-content">
            <h4 class="vl-toast-title">{{ toast.title }}</h4>
            <p class="vl-toast-message">{{ toast.message }}</p>
          </div>
          <button
            type="button"
            class="vl-toast-close"
            :aria-label="closeLabel ?? 'Close notification'"
            @click="emit('close', toast.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.vl-toast-container {
  position: fixed;
  top: var(--vdl-space-4);
  right: var(--vdl-space-4);
  width: min(320px, calc(100vw - var(--vdl-space-8)));
  z-index: var(--vdl-z-index-toast);
  display: flex;
  flex-direction: column;
  gap: var(--vdl-space-3);
  pointer-events: none;
}

.vl-toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  padding: var(--vdl-space-4);
  background-color: var(--vdl-bg-panel);
  border-radius: var(--vdl-radius-md);
  border: 1px solid var(--vdl-border-strong);
  box-shadow: var(--vdl-shadow-panel);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.vl-toast-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.is-success::before {
  background-color: var(--vdl-success);
}
.is-error::before {
  background-color: var(--vdl-danger);
}
.is-warning::before {
  background-color: var(--vdl-warning);
}
.is-info::before {
  background-color: var(--vdl-info);
}

.vl-toast-icon {
  font-size: 20px;
  margin-right: var(--vdl-space-3);
  flex-shrink: 0;
}

.vl-toast-content {
  flex-grow: 1;
  min-width: 0;
}

.vl-toast-title {
  margin: 0 0 var(--vdl-space-1);
  font-size: var(--vdl-font-body);
  font-weight: 600;
  color: var(--vdl-text-primary);
}

.vl-toast-message {
  margin: 0;
  font-size: var(--vdl-font-body-sm);
  color: var(--vdl-text-secondary);
  line-height: 1.4;
}

.vl-toast-close {
  background: none;
  border: none;
  color: var(--vdl-text-muted);
  font-size: 20px;
  cursor: pointer;
  margin-left: var(--vdl-space-2);
  line-height: 1;
}

.vl-toast-close:hover {
  color: var(--vdl-text-primary);
}

.vl-toast-close:focus-visible {
  outline: none;
  border-radius: var(--vdl-radius-xs);
  box-shadow: var(--vdl-focus-ring);
}

/* 过渡动画 */
.vl-toast-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.vl-toast-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.vl-toast-list-leave-active {
  position: absolute;
}
</style>
