<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * @file VeyActionMenu.vue
 * @description Veydeck 平台自研操作菜单组件，支持自定义操作列表和图标。
 */

import VeyTooltip from "./VeyTooltip.vue";
import VeyIcon from "./VeyIcon.vue";
import { computeFloatingPosition } from "../internal/floating-position";

interface Action {
  label: string;
  className?: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
  handler: () => void;
}

const props = withDefaults(
  defineProps<{
    glass?: VeyGlassValue;
    /** 操作列表 */
    actions: Action[];
    /** 按钮文案 */
    label?: string;
    /** 是否禁用菜单入口 */
    disabled?: boolean;
    /** 菜单项默认图标 */
    defaultIcon?: string;
  }>(),
  {
    glass: undefined,
    disabled: false,
    defaultIcon: "settings",
  },
);

const showMenu = ref(false);
const dropdownPositioned = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});
const dropdownPlacement = ref<"top" | "bottom">("bottom");
const ACTION_MENU_OPEN_EVENT = "veydeck-action-menu-open";

const updateDropdownPosition = () => {
  if (!menuRef.value || !dropdownRef.value || !showMenu.value) return;
  const position = computeFloatingPosition({
    anchor: menuRef.value,
    floating: dropdownRef.value,
  });
  dropdownPlacement.value = position.placement;
  dropdownStyle.value = position.style;
  dropdownPositioned.value = true;
};

const closeMenu = () => {
  showMenu.value = false;
  dropdownPositioned.value = false;
};

const openMenu = (focusFirst = false) => {
  dropdownPositioned.value = false;
  showMenu.value = true;
  document.dispatchEvent(
    new CustomEvent(ACTION_MENU_OPEN_EVENT, { detail: menuRef.value }),
  );
  nextTick(() => {
    updateDropdownPosition();
    if (focusFirst) focusItem(0);
  });
};

const toggleMenu = () => {
  if (props.disabled) return;
  if (showMenu.value) closeMenu();
  else openMenu();
};

const handleActionClick = (action: Action) => {
  if (action.disabled) return;
  action.handler();
  closeMenu();
};
const focusItem = (index: number) => {
  const items = [
    ...(dropdownRef.value?.querySelectorAll<HTMLButtonElement>(
      ".vl-dropdown-item:not(:disabled)",
    ) ?? []),
  ];
  items[(index + items.length) % items.length]?.focus();
};
const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (!["Enter", " ", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  openMenu(true);
};
const handleMenuKeydown = (event: KeyboardEvent) => {
  const items = [
    ...(dropdownRef.value?.querySelectorAll<HTMLButtonElement>(
      ".vl-dropdown-item:not(:disabled)",
    ) ?? []),
  ];
  const index = items.indexOf(document.activeElement as HTMLButtonElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    focusItem(index + (event.key === "ArrowDown" ? 1 : -1));
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    focusItem(event.key === "Home" ? 0 : items.length - 1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeMenu();
    menuRef.value?.querySelector<HTMLButtonElement>(".vl-action-btn")?.focus();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    menuRef.value &&
    !menuRef.value.contains(target) &&
    (!dropdownRef.value || !dropdownRef.value.contains(target))
  ) {
    closeMenu();
  }
};

const handleOtherMenuOpen = (event: Event) => {
  if ((event as CustomEvent<HTMLElement | null>).detail !== menuRef.value) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener(ACTION_MENU_OPEN_EVENT, handleOtherMenuOpen);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener(ACTION_MENU_OPEN_EVENT, handleOtherMenuOpen);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});
const vGlass = useGlass(() => props.glass, "control");
</script>

<template>
  <div class="vl-action-menu" ref="menuRef">
    <button
      type="button"
      v-glass
      class="vl-action-btn"
      :disabled="disabled"
      aria-haspopup="menu"
      :aria-expanded="showMenu"
      @click.stop="toggleMenu"
      @keydown="handleTriggerKeydown"
    >
      <VeyIcon class="vl-action-btn-icon" name="settings" :size="16" />
      <span class="vl-action-btn-text">{{ label || "操作" }}</span>
    </button>
    <teleport to="body">
      <transition name="vl-fade">
        <div
          v-if="showMenu"
          ref="dropdownRef"
          v-glass
          class="vl-dropdown"
          :class="{ 'is-positioned': dropdownPositioned }"
          role="menu"
          :style="dropdownStyle"
          :data-placement="dropdownPlacement"
          @click.stop
          @keydown="handleMenuKeydown"
        >
          <template v-for="(action, index) in actions" :key="index">
            <VeyTooltip
              :glass="glass"
              :text="action.tooltip || ''"
              :disabled="!action.tooltip"
              position="right"
              class="vl-dropdown-tooltip-wrapper"
            >
              <button
                class="vl-dropdown-item"
                role="menuitem"
                :class="[action.className, { 'is-disabled': action.disabled }]"
                :disabled="action.disabled"
                @click="handleActionClick(action)"
              >
                <VeyIcon
                  class="vl-dropdown-icon"
                  :name="action.icon || defaultIcon"
                  :size="16"
                />
                <span class="vl-dropdown-label">{{ action.label }}</span>
              </button>
            </VeyTooltip>
          </template>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.vl-action-menu {
  position: relative;
  display: inline-block;
}

.vl-action-btn {
  background-color: var(--vdl-bg-muted);
  color: var(--vdl-text-primary);
  padding: 0 var(--vdl-space-3);
  height: 32px;
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: var(--vdl-font-body-sm);
  font-family: var(--vdl-font-family);
  display: flex;
  align-items: center;
  gap: var(--vdl-space-2);
}

.vl-action-btn:hover {
  background-color: var(--vdl-bg-hover);
  border-color: var(--vdl-border-brand);
}
.vl-action-btn:focus-visible,
.vl-dropdown-item:focus-visible {
  outline: none;
  box-shadow: var(--vdl-focus-ring);
}

.vl-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vl-dropdown {
  position: fixed;
  background-color: var(--vdl-bg-panel);
  border: 1px solid var(--vdl-border-strong);
  border-radius: var(--vdl-radius-md);
  box-shadow: var(--vdl-shadow-panel);
  z-index: calc(var(--vdl-z-index-modal) + 1);
  min-width: 140px;
  padding: var(--vdl-space-1);
  max-height: 260px;
  overflow-y: auto;
}

.vl-dropdown:not(.is-positioned) {
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
}

.vl-dropdown-tooltip-wrapper {
  display: block;
  width: 100%;
}

.vl-dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--vdl-space-2);
  width: 100%;
  padding: var(--vdl-space-2) var(--vdl-space-3);
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: var(--vdl-font-body-sm);
  font-family: var(--vdl-font-family);
  color: var(--vdl-text-secondary);
  transition: all 0.2s;
  border-radius: var(--vdl-radius-sm);
}

.vl-dropdown-item:hover:not(:disabled) {
  background-color: var(--vdl-bg-hover);
  color: var(--vdl-text-primary);
}

.vl-dropdown-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.vl-dropdown-icon {
  width: 20px;
  opacity: 0.8;
}

/* 业务语义颜色扩展 */
.vl-dropdown-item.app-btn-start {
  color: var(--vdl-primary);
}
.vl-dropdown-item.app-btn-stop {
  color: var(--vdl-warning);
}
.vl-dropdown-item.app-btn-delete {
  color: var(--vdl-danger);
}

.vl-fade-enter-active,
.vl-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.vl-fade-enter-from,
.vl-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
