<script setup lang="ts">
import { computed, useId } from "vue";

/**
 * @file VeyFormItem.vue
 * @description Veydeck 平台自研表单项组件，处理标签和布局。
 */

interface Props {
  /** 标签文本 */
  label?: string;
  /** 是否必填 (显示红星) */
  required?: boolean;
  /** 提示文本 */
  hint?: string;
  for?: string;
  error?: string;
  labelId?: string;
  hintId?: string;
  errorId?: string;
}

const props = defineProps<Props>();
const generatedId = useId();
const resolvedLabelId = computed(() => props.labelId ?? `${generatedId}-label`);
const resolvedHintId = computed(() => props.hintId ?? `${generatedId}-hint`);
const resolvedErrorId = computed(() => props.errorId ?? `${generatedId}-error`);
</script>

<template>
  <div class="vl-form-item">
    <label
      v-if="label"
      :id="resolvedLabelId"
      class="vl-form-item-label"
      :for="for"
    >
      <span v-if="required" class="vl-form-item-required">*</span>
      {{ label }}
    </label>
    <div class="vl-form-item-content">
      <slot></slot>
      <div v-if="hint" :id="resolvedHintId" class="vl-form-item-hint">
        {{ hint }}
      </div>
      <div
        v-if="error"
        :id="resolvedErrorId"
        class="vl-form-item-error"
        role="alert"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.vl-form-item {
  margin-bottom: var(--vdl-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--vdl-space-2);
}

.vl-form-item-label {
  font-size: var(--vdl-font-body-sm);
  font-weight: 600;
  color: var(--vdl-text-secondary);
  line-height: 1.4;
  user-select: none;
}

.vl-form-item-required {
  color: var(--vdl-danger);
  margin-right: 4px;
}

.vl-form-item-content {
  position: relative;
  width: 100%;
}

.vl-form-item-hint {
  margin-top: var(--vdl-space-1);
  font-size: var(--vdl-font-caption);
  color: var(--vdl-text-muted);
  line-height: 1.4;
}
.vl-form-item-error {
  margin-top: var(--vdl-space-1);
  color: var(--vdl-danger);
  font-size: var(--vdl-font-caption);
}
</style>
