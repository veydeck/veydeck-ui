<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
/**
 * @file VeyTabs.vue
 * @description Veydeck 平台自研标签页组件，支持单选高亮，严格遵循 VDL 设计规范。
 */

interface TabItem {
  label: string;
  name: string;
  disabled?: boolean;
}

interface Props {
  glass?: VeyGlassValue;
  /** 当前选中的标签页 name */
  modelValue: string;
  /** 标签页列表 */
  tabs: TabItem[];
}

const props = withDefaults(defineProps<Props>(), { glass: undefined });

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

function handleTabClick(tab: TabItem) {
  if (tab.disabled) return;
  emit("update:modelValue", tab.name);
  emit("change", tab.name);
}
function handleKeydown(event: KeyboardEvent, index: number) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const enabled = props.tabs
    .map((tab, tabIndex) => ({ tab, tabIndex }))
    .filter(({ tab }) => !tab.disabled);
  const current = enabled.findIndex(({ tabIndex }) => tabIndex === index);
  const target =
    event.key === "Home"
      ? enabled[0]
      : event.key === "End"
        ? enabled.at(-1)
        : enabled[
            (current + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) %
              enabled.length
          ];
  if (target) {
    handleTabClick(target.tab);
    document
      .querySelector<HTMLElement>(`[data-tab-name="${target.tab.name}"]`)
      ?.focus();
  }
}
const vGlass = useGlass(() => props.glass, "control");
</script>

<template>
  <div class="vl-tabs">
    <div class="vl-tabs-nav" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        type="button"
        :key="tab.name"
        v-glass="modelValue === tab.name"
        class="vl-tabs-item"
        :class="{
          'is-active': modelValue === tab.name,
          'is-disabled': tab.disabled,
        }"
        role="tab"
        :aria-selected="modelValue === tab.name"
        :tabindex="modelValue === tab.name ? 0 : -1"
        :disabled="tab.disabled"
        :data-tab-name="tab.name"
        @click="handleTabClick(tab)"
        @keydown="handleKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.vl-tabs {
  width: 100%;
}

.vl-tabs-nav {
  display: flex;
  align-items: center;
  gap: var(--vdl-space-6);
  border-bottom: 1px solid var(--vdl-border-subtle);
  padding: 0 var(--vdl-space-1);
}

.vl-tabs-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--vdl-font-body);
  color: var(--vdl-text-secondary);
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  user-select: none;
  padding: 0 var(--vdl-space-4);
  border: 0;
  background: transparent;
}
.vl-tabs-item:focus-visible {
  outline: none;
  box-shadow: var(--vdl-focus-ring);
}

.vl-tabs-item:hover:not(.is-disabled) {
  color: var(--vdl-text-primary);
}

.vl-tabs-item.is-active {
  color: var(--vdl-primary);
  font-weight: 600;
}

.vl-tabs-item.is-active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--vdl-primary);
  border-radius: var(--vdl-radius-pill) var(--vdl-radius-pill) 0 0;
}

.vl-tabs-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>
