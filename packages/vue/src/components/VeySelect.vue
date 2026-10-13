<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  computed,
  nextTick,
  useId,
} from "vue";
import { computeFloatingPosition } from "../internal/floating-position";

/**
 * @file VeySelect.vue
 * @description Veydeck 平台自研下拉选择组件，支持自定义内容渲染和 Teleport 浮层。
 */

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
  hint?: string;
}

const props = withDefaults(
  defineProps<{
    glass?: VeyGlassValue;
    /** 绑定值 */
    modelValue: string | number | null;
    /** 选项列表 */
    options: Option[];
    /** 占位符 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean;
    id?: string;
    name?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
  }>(),
  { glass: undefined },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "option-disabled", option: Option): void;
  (e: "dropdown-scroll", event: Event): void;
  (e: "dropdown-reach-bottom", event: Event): void;
}>();

const SCROLL_BOTTOM_THRESHOLD = 24;
const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownPlacement = ref<"top" | "bottom">("bottom");
const activeIndex = ref(-1);
const generatedId = useId();
const resolvedId = computed(() => props.id ?? generatedId);
const listboxId = `${generatedId}-listbox`;
const dropdownStyle = ref<Record<string, string>>({
  visibility: "hidden",
});

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(
    (opt) => opt.value === props.modelValue,
  );
  return selectedOption ? selectedOption.label : props.placeholder || "请选择";
});

const calculatePosition = () => {
  if (!selectRef.value || !dropdownRef.value || !isOpen.value) return;
  const position = computeFloatingPosition({
    anchor: selectRef.value,
    floating: dropdownRef.value,
    matchWidth: true,
  });
  dropdownPlacement.value = position.placement;
  dropdownStyle.value = position.style;
};

watch(isOpen, (val) => {
  if (val) {
    dropdownStyle.value = { visibility: "hidden" };
    nextTick(() => {
      calculatePosition();
    });
  }
});

watch(
  () => props.options.length,
  () => {
    if (isOpen.value) nextTick(calculatePosition);
  },
);

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    const selected = props.options.findIndex(
      (option) => option.value === props.modelValue && !option.disabled,
    );
    activeIndex.value =
      selected >= 0
        ? selected
        : props.options.findIndex((option) => !option.disabled);
  }
}

function selectOption(option: Option) {
  if (props.disabled) return;
  if (option.disabled) {
    emit("option-disabled", option);
    return;
  }
  emit("update:modelValue", option.value);
  isOpen.value = false;
}

function moveActive(direction: 1 | -1) {
  if (!props.options.length) return;
  let next = activeIndex.value;
  for (let count = 0; count < props.options.length; count += 1) {
    next = (next + direction + props.options.length) % props.options.length;
    if (!props.options[next]?.disabled) {
      activeIndex.value = next;
      nextTick(() =>
        dropdownRef.value
          ?.querySelector<HTMLElement>(`[data-option-index="${next}"]`)
          ?.scrollIntoView({ block: "nearest" }),
      );
      return;
    }
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    if (!isOpen.value) toggleDropdown();
    if (event.key === "ArrowDown") moveActive(1);
    else if (event.key === "ArrowUp") moveActive(-1);
    else {
      const indexes = props.options
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !option.disabled);
      activeIndex.value =
        event.key === "Home"
          ? (indexes[0]?.index ?? -1)
          : (indexes.at(-1)?.index ?? -1);
    }
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!isOpen.value) toggleDropdown();
    else if (activeIndex.value >= 0)
      selectOption(props.options[activeIndex.value]);
  } else if (event.key === "Escape" && isOpen.value) {
    event.preventDefault();
    isOpen.value = false;
  }
}

function handleDropdownScroll(event: Event) {
  emit("dropdown-scroll", event);

  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;

  const distanceToBottom =
    target.scrollHeight - target.scrollTop - target.clientHeight;
  if (distanceToBottom <= SCROLL_BOTTOM_THRESHOLD) {
    emit("dropdown-reach-bottom", event);
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (
    selectRef.value &&
    !selectRef.value.contains(target) &&
    (!dropdownRef.value || !dropdownRef.value.contains(target))
  ) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", calculatePosition);
  window.addEventListener("scroll", calculatePosition, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", calculatePosition);
  window.removeEventListener("scroll", calculatePosition, true);
});
const vGlass = useGlass(() => props.glass, "input");
</script>

<template>
  <div
    class="vl-select"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
    ref="selectRef"
  >
    <button
      :id="resolvedId"
      type="button"
      v-glass
      class="vl-select-trigger"
      role="combobox"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <span class="vl-select-label">{{ selectedLabel }}</span>
      <span class="vl-select-arrow"></span>
    </button>
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="modelValue ?? ''"
      :disabled="disabled"
    />
    <teleport to="body">
      <Transition name="vl-select-fade">
        <ul
          v-if="isOpen"
          ref="dropdownRef"
          v-glass
          class="vl-select-options"
          :id="listboxId"
          role="listbox"
          :style="dropdownStyle"
          :data-placement="dropdownPlacement"
          @scroll="handleDropdownScroll"
        >
          <li
            v-for="(option, index) in options"
            :key="option.value"
            class="vl-select-option"
            role="option"
            :aria-selected="modelValue === option.value"
            :aria-disabled="option.disabled || undefined"
            :data-option-index="index"
            :class="{
              selected: modelValue === option.value,
              active: activeIndex === index,
              disabled: option.disabled,
            }"
            :title="option.hint"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </li>
          <li v-if="$slots['dropdown-footer']" class="vl-select-footer">
            <slot name="dropdown-footer" />
          </li>
        </ul>
      </Transition>
    </teleport>
  </div>
</template>

<style scoped>
.vl-select {
  position: relative;
  width: 100%;
  font-size: var(--vdl-font-body);
}

.vl-select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--vdl-space-3);
  height: 36px;
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-md);
  background-color: var(--vdl-bg-input);
  color: var(--vdl-text-primary);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  text-align: left;
}

.vl-select.is-disabled .vl-select-trigger {
  background-color: var(--vdl-bg-muted);
  cursor: not-allowed;
  color: var(--vdl-text-subtle);
  border-color: var(--vdl-border-subtle);
}

.vl-select:not(.is-disabled) .vl-select-trigger:hover {
  border-color: var(--vdl-border-strong);
}

.vl-select.is-open .vl-select-trigger {
  border-color: var(--vdl-primary);
  box-shadow: var(--vdl-focus-ring);
}

.vl-select-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--vdl-text-muted);
  transition: transform 0.2s ease;
}

.vl-select.is-open .vl-select-arrow {
  transform: rotate(180deg);
}

.vl-select-options {
  position: fixed;
  background-color: var(--vdl-bg-panel);
  border: 1px solid var(--vdl-border-strong);
  border-radius: var(--vdl-radius-md);
  box-shadow: var(--vdl-shadow-panel);
  width: max-content;
  overflow-y: auto;
  box-sizing: border-box;
  list-style: none;
  padding: var(--vdl-space-1);
  margin: 0;
  z-index: calc(var(--vdl-z-index-modal) + 1);
}

.vl-select-option {
  padding: var(--vdl-space-2) var(--vdl-space-3);
  border-radius: var(--vdl-radius-sm);
  cursor: pointer;
  color: var(--vdl-text-secondary);
  transition: all 0.2s;
  font-size: var(--vdl-font-body-sm);
  white-space: nowrap;
}

.vl-select-option:hover {
  background-color: var(--vdl-bg-hover);
  color: var(--vdl-text-primary);
}
.vl-select-option.active {
  background-color: var(--vdl-bg-hover);
}
.vl-select-trigger:focus-visible {
  outline: none;
  box-shadow: var(--vdl-focus-ring);
  border-color: var(--vdl-primary);
}

.vl-select-option.selected {
  background-color: var(--vdl-bg-active);
  color: var(--vdl-primary);
  font-weight: 600;
}

.vl-select-option.disabled {
  color: var(--vdl-text-subtle);
  cursor: not-allowed;
}

.vl-select-footer {
  padding: var(--vdl-space-2) var(--vdl-space-3);
  color: var(--vdl-text-subtle);
  font-size: var(--vdl-font-body-sm);
  list-style: none;
}

.vl-select-fade-enter-active,
.vl-select-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.vl-select-fade-enter-from,
.vl-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
