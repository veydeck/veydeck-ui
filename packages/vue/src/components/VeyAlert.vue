<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeyAlert.vue
 * @description Veydeck 平台自研通知横幅组件，严格遵循 VDL 设计规范。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 警告标题 */
  title?: string;
  /** 警告描述 (如果有 title, 则在下方显示) */
  description?: string;
  /** 警告类型 */
  type?: "success" | "warning" | "error" | "info";
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭按钮的无障碍标签 */
  closeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  type: "info",
  showIcon: false,
  closable: false,
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

import { ref } from "vue";
import VeyIcon from "./VeyIcon.vue";
const visible = ref(true);
const vGlass = useGlass(() => props.glass, "surface");

function handleClose() {
  visible.value = false;
  emit("close");
}

function alertIcon(type: NonNullable<Props["type"]>) {
  if (type === "success") return "success";
  if (type === "error") return "error";
  if (type === "warning") return "warning";
  return "info";
}
</script>

<template>
  <Transition name="vl-alert-fade">
    <div
      v-if="visible"
      v-glass
      class="vl-alert"
      :class="[`is-${type}`]"
      role="alert"
    >
      <div v-if="showIcon" class="vl-alert-icon">
        <VeyIcon :name="alertIcon(type)" :size="16" />
      </div>
      <div class="vl-alert-content">
        <h4 v-if="title" class="vl-alert-title">{{ title }}</h4>
        <div class="vl-alert-description">
          <slot>{{ description }}</slot>
        </div>
      </div>
      <button
        v-if="closable"
        type="button"
        class="vl-alert-close"
        :aria-label="closeLabel ?? 'Close alert'"
        @click="handleClose"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.vl-alert {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: var(--vdl-space-2) var(--vdl-space-4);
  border-radius: var(--vdl-radius-md);
  border: 1px solid transparent;
  box-sizing: border-box;
  margin-bottom: var(--vdl-space-3);
  font-family: var(--vdl-font-family);
}

.vl-alert-icon {
  margin-right: var(--vdl-space-3);
  font-size: 16px;
  line-height: 1.6;
}

.vl-alert-content {
  flex: 1;
  min-width: 0;
}

.vl-alert-title {
  margin: 0;
  font-size: var(--vdl-font-body);
  font-weight: 600;
  line-height: 1.6;
}

.vl-alert-description {
  font-size: var(--vdl-font-body-sm);
  line-height: 1.6;
}

.vl-alert-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  margin-left: var(--vdl-space-3);
  line-height: 1;
  transition: opacity 0.2s;
}

.vl-alert-close:hover {
  opacity: 1;
}

.vl-alert-close:focus-visible {
  outline: none;
  border-radius: var(--vdl-radius-xs);
  box-shadow: var(--vdl-focus-ring);
}

/* --- 类型预设 (VDL 软色调) --- */
.is-info {
  background-color: var(--vdl-info-soft);
  color: var(--vdl-info);
  border-color: rgba(0, 200, 255, 0.2);
}

.is-success {
  background-color: var(--vdl-success-soft);
  color: var(--vdl-success);
  border-color: rgba(0, 210, 122, 0.2);
}

.is-warning {
  background-color: var(--vdl-warning-soft);
  color: var(--vdl-warning);
  border-color: rgba(255, 181, 71, 0.2);
}

.is-error {
  background-color: var(--vdl-danger-soft);
  color: var(--vdl-danger);
  border-color: rgba(255, 94, 122, 0.2);
}

/* 动画 */
.vl-alert-fade-enter-active,
.vl-alert-fade-leave-active {
  transition: opacity 0.3s ease;
}

.vl-alert-fade-enter-from,
.vl-alert-fade-leave-to {
  opacity: 0;
}
</style>
