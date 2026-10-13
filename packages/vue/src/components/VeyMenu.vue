<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { ref } from "vue";
/**
 * @file VeyMenu.vue
 * @description Veydeck 平台自研侧边栏菜单组件，支持分组和单选高亮，严格遵循 VDL 设计规范。
 */

interface MenuItem {
  key: string;
  label: string;
}

interface MenuCategory {
  key: string;
  label: string;
  children: MenuItem[];
}

interface Props {
  glass?: VeyGlassValue;
  /** 当前选中的菜单项 key */
  modelValue: string;
  /** 菜单项列表 (带分组) */
  items: MenuCategory[];
}

const props = withDefaults(defineProps<Props>(), { glass: undefined });

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

function handleSelect(key: string) {
  emit("update:modelValue", key);
  emit("change", key);
}
const menuRef = ref<HTMLElement | null>(null);
function handleKeydown(event: KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const items = [
    ...(menuRef.value?.querySelectorAll<HTMLButtonElement>(
      ".vl-menu-item-button",
    ) ?? []),
  ];
  const current = items.indexOf(document.activeElement as HTMLButtonElement);
  const index =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
          items.length;
  event.preventDefault();
  items[index]?.focus();
}
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <nav
    ref="menuRef"
    v-glass
    class="vl-menu"
    aria-label="Menu"
    @keydown="handleKeydown"
  >
    <div v-for="category in items" :key="category.key" class="vl-menu-group">
      <div class="vl-menu-group-title">{{ category.label }}</div>
      <ul class="vl-menu-items">
        <li
          v-for="item in category.children"
          :key="item.key"
          class="vl-menu-item"
          :class="{ 'is-active': modelValue === item.key }"
        >
          <button
            type="button"
            class="vl-menu-item-button"
            :aria-current="modelValue === item.key ? 'page' : undefined"
            @click="handleSelect(item.key)"
          >
            <span class="vl-menu-item-label">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.vl-menu {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--vdl-space-5);
  font-family: var(--vdl-font-family);
  user-select: none;
}

.vl-menu-group {
  display: flex;
  flex-direction: column;
  gap: var(--vdl-space-2);
}

.vl-menu-group-title {
  padding: 0 var(--vdl-space-2);
  font-size: var(--vdl-font-caption);
  font-weight: 700;
  color: var(--vdl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vl-menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vl-menu-item {
  height: 38px;
  padding: 0 var(--vdl-space-4);
  display: flex;
  align-items: center;
  border-radius: var(--vdl-radius-md);
  color: var(--vdl-text-secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.vl-menu-item-button {
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: inherit;
  font: inherit;
}
.vl-menu-item-button:focus-visible {
  outline: none;
  box-shadow: var(--vdl-focus-ring);
  border-radius: var(--vdl-radius-md);
}

.vl-menu-item:hover {
  background-color: var(--vdl-bg-hover);
  color: var(--vdl-text-primary);
}

.vl-menu-item.is-active {
  background-color: var(--vdl-bg-active);
  color: var(--vdl-primary);
  font-weight: 600;
}

.vl-menu-item.is-active::before {
  content: "";
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: var(--vdl-radius-pill);
  background-color: var(--vdl-primary);
}

.vl-menu-item-label {
  font-size: var(--vdl-font-body);
}
</style>
