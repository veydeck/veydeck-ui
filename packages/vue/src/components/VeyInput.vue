<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { computed, ref, useId } from "vue";
import VeyIcon from "./VeyIcon.vue";

/**
 * @file VeyInput.vue
 * @description Veydeck 平台自研输入框组件，严格遵循 VDL 设计规范。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 绑定值 */
  modelValue: string | number | null;
  /** 输入类型 */
  type?: "text" | "password" | "textarea" | "number" | "datetime-local";
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 最大长度 */
  maxlength?: number;
  /** 行数 (仅 textarea 有效) */
  rows?: number;
  /** 是否显示密码切换按钮 */
  showPassword?: boolean;
  /** 最小值 (仅 number 有效) */
  min?: number | string;
  /** 最大值 (仅 number 有效) */
  max?: number | string;
  /** 步长 (仅 number 有效) */
  step?: number | string;
  /** 自动填充属性 */
  autocomplete?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  type: "text",
  disabled: false,
  readonly: false,
  rows: 3,
  showPassword: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
  (e: "change", value: string | number | null): void;
}>();

const isPasswordVisible = ref(false);
const generatedId = useId();
const resolvedId = computed(() => props.id ?? generatedId);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit(
    "update:modelValue",
    props.type === "number"
      ? target.value === ""
        ? null
        : Number(target.value)
      : target.value,
  );
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit(
    "change",
    props.type === "number"
      ? target.value === ""
        ? null
        : Number(target.value)
      : target.value,
  );
}

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

const inputType = computed(() => {
  if (props.type === "password" && isPasswordVisible.value) {
    return "text";
  }
  return props.type;
});
const vGlass = useGlass(() => props.glass, "input");
</script>

<template>
  <div
    class="vl-input-wrapper"
    :class="[`is-${type}`, { 'is-disabled': disabled }]"
  >
    <template v-if="type === 'textarea'">
      <textarea
        v-glass
        class="vl-textarea"
        :id="resolvedId"
        :name="name"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="invalid || undefined"
        :value="modelValue?.toString()"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        @input="handleInput"
        @change="handleChange"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      ></textarea>
    </template>
    <template v-else>
      <div v-glass class="vl-input-inner-wrapper">
        <input
          class="vl-input"
          :id="resolvedId"
          :name="name"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="ariaDescribedby"
          :aria-invalid="invalid || undefined"
          :type="inputType"
          :value="modelValue?.toString()"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :min="min"
          :max="max"
          :step="step"
          :autocomplete="autocomplete"
          @input="handleInput"
          @change="handleChange"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        />
        <button
          v-if="showPassword && type === 'password'"
          type="button"
          class="vl-input-password-toggle"
          :disabled="disabled"
          :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
          :aria-pressed="isPasswordVisible"
          @click="togglePasswordVisibility"
        >
          <VeyIcon :name="isPasswordVisible ? 'eye-off' : 'lock'" :size="16" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.vl-input-wrapper {
  position: relative;
  width: 100%;
  font-family: var(--vdl-font-family);
}

.vl-input-inner-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: var(--vdl-bg-input);
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.vl-input-inner-wrapper:focus-within {
  border-color: var(--vdl-primary);
  box-shadow: var(--vdl-focus-ring);
}

.vl-input {
  flex: 1;
  height: 36px;
  padding: 0 var(--vdl-space-3);
  background: transparent;
  border: none;
  outline: none;
  color: var(--vdl-text-primary);
  font-size: var(--vdl-font-body);
  width: 100%;
  box-sizing: border-box;
}

.vl-textarea {
  width: 100%;
  background-color: var(--vdl-bg-input);
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-md);
  padding: var(--vdl-space-2) var(--vdl-space-3);
  color: var(--vdl-text-primary);
  font-size: var(--vdl-font-body);
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: all 0.2s;
  display: block;
}

.vl-textarea:focus {
  border-color: var(--vdl-primary);
  box-shadow: var(--vdl-focus-ring);
}

.vl-input-wrapper.is-disabled .vl-input-inner-wrapper,
.vl-input-wrapper.is-disabled .vl-textarea {
  background-color: var(--vdl-bg-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.vl-input:disabled,
.vl-textarea:disabled {
  cursor: not-allowed;
}

.vl-input-password-toggle {
  background: none;
  border: none;
  padding: 0 var(--vdl-space-2);
  cursor: pointer;
  font-size: 14px;
  color: var(--vdl-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.vl-input-password-toggle:hover {
  color: var(--vdl-text-primary);
}

.vl-input::placeholder,
.vl-textarea::placeholder {
  color: var(--vdl-text-subtle);
}
</style>
