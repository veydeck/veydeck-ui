<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { computed, ref, useId, watchEffect } from "vue";
/**
 * @file VeyCheckbox.vue
 * @description Veydeck 平台自研复选框组件，严格遵循 VDL 设计规范。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 绑定值 */
  modelValue: boolean;
  /** 禁用状态 */
  disabled?: boolean;
  indeterminate?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: boolean): void;
}>();
const inputRef = ref<HTMLInputElement | null>(null);
const generatedId = useId();
const resolvedId = computed(() => props.id ?? generatedId);
watchEffect(() => {
  if (inputRef.value)
    inputRef.value.indeterminate = Boolean(props.indeterminate);
});

function toggle() {
  if (props.disabled) return;
  const newValue = !props.modelValue;
  emit("update:modelValue", newValue);
  emit("change", newValue);
}
const vGlass = useGlass(() => props.glass, "input");
</script>

<template>
  <label
    class="vl-checkbox"
    :for="resolvedId"
    :class="{
      'is-active': modelValue,
      'is-indeterminate': indeterminate,
      'is-disabled': disabled,
    }"
  >
    <span class="vl-checkbox-input">
      <input
        ref="inputRef"
        :id="resolvedId"
        :name="name"
        type="checkbox"
        class="vl-checkbox-original"
        :checked="modelValue"
        :disabled="disabled"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-checked="indeterminate ? 'mixed' : modelValue"
        @change="toggle"
      />
      <span v-glass class="vl-checkbox-inner"></span>
    </span>
    <span v-if="$slots.default" class="vl-checkbox-label">
      <slot></slot>
    </span>
  </label>
</template>

<style scoped>
.vl-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: var(--vdl-font-body-sm);
  color: var(--vdl-text-primary);
  gap: var(--vdl-space-2);
}

.vl-checkbox.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.vl-checkbox-input {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.vl-checkbox-original {
  opacity: 0;
  outline: none;
  position: absolute;
  margin: 0;
  width: 0;
  height: 0;
  z-index: -1;
}

.vl-checkbox-inner {
  display: inline-block;
  position: relative;
  border: 1px solid var(--vdl-border-default);
  border-radius: 2px;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  background-color: var(--vdl-bg-input);
  z-index: 1;
  transition:
    border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
    background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
}

.vl-checkbox-inner::after {
  box-sizing: content-box;
  content: "";
  border: 2px solid var(--vdl-text-inverse);
  border-left: 0;
  border-top: 0;
  height: 8px;
  left: 5px;
  position: absolute;
  top: 1px;
  transform: rotate(45deg) scaleY(0);
  width: 3px;
  transition: transform 0.15s ease-in 0.05s;
  transform-origin: center;
}

.vl-checkbox-inner::before {
  box-sizing: border-box;
  content: "";
  position: absolute;
  left: 3px;
  right: 3px;
  top: 6px;
  height: 2px;
  border-radius: var(--vdl-radius-pill);
  background-color: var(--vdl-text-inverse);
  transform: scaleX(0);
  transition: transform 0.15s ease-in;
}

.vl-checkbox.is-active .vl-checkbox-inner,
.vl-checkbox.is-indeterminate .vl-checkbox-inner {
  border-color: var(--vdl-primary);
}

.vl-checkbox.is-active .vl-checkbox-inner[data-glass-mode="solid"],
.vl-checkbox.is-indeterminate .vl-checkbox-inner[data-glass-mode="solid"] {
  background-color: var(--vdl-primary);
}

.vl-checkbox.is-active .vl-checkbox-inner::after {
  transform: rotate(45deg) scaleY(1);
}

.vl-checkbox.is-indeterminate .vl-checkbox-inner::before {
  transform: scaleX(1);
}

.vl-checkbox.is-indeterminate .vl-checkbox-inner::after {
  transform: rotate(45deg) scaleY(0);
}

.vl-checkbox:hover:not(.is-disabled) .vl-checkbox-inner {
  border-color: var(--vdl-primary);
}
.vl-checkbox-original:focus-visible + .vl-checkbox-inner {
  box-shadow: var(--vdl-focus-ring);
  border-color: var(--vdl-primary);
}

.vl-checkbox-label {
  line-height: 1;
}
</style>
