<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeySwitch.vue
 * @description Veydeck 平台自研开关组件，严格遵循 VDL 设计规范。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 绑定值 */
  modelValue: boolean;
  /** 激活时的文字 */
  activeText?: string;
  /** 禁用状态 */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  activeText: "",
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: boolean): void;
}>();

function toggle() {
  if (props.disabled) return;
  const newValue = !props.modelValue;
  emit("update:modelValue", newValue);
  emit("change", newValue);
}
const vGlass = useGlass(() => props.glass, "control");
</script>

<template>
  <button
    type="button"
    class="vl-switch"
    :class="{ 'is-active': modelValue, 'is-disabled': disabled }"
    @click="toggle"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
  >
    <div class="vl-switch-track">
      <div v-glass class="vl-switch-handle"></div>
    </div>
    <span v-if="activeText" class="vl-switch-label">{{ activeText }}</span>
  </button>
</template>

<style scoped>
.vl-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: var(--vdl-space-2);
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
}
.vl-switch:focus-visible {
  outline: none;
  box-shadow: var(--vdl-focus-ring);
  border-radius: var(--vdl-radius-pill);
}

.vl-switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.vl-switch-track {
  position: relative;
  width: 40px;
  height: 20px;
  background-color: var(--vdl-bg-muted);
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-pill);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.vl-switch.is-active .vl-switch-track {
  background-color: var(--vdl-primary);
  border-color: var(--vdl-primary);
}

.vl-switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background-color: var(--vdl-text-primary);
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.vl-switch.is-active .vl-switch-handle {
  transform: translateX(20px);
  background-color: var(--vdl-text-inverse);
}

.vl-switch-label {
  font-size: var(--vdl-font-body-sm);
  color: var(--vdl-text-secondary);
}

.vl-switch.is-active .vl-switch-label {
  color: var(--vdl-text-primary);
}
</style>
