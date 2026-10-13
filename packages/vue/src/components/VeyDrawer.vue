<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { activateModalLifecycle } from "../internal/modal-lifecycle";

defineOptions({
  inheritAttrs: false,
});

/**
 * @file VeyDrawer.vue
 * @description Veydeck 平台自研侧边抽屉组件，严格遵循 VDL 设计规范。
 */

const props = withDefaults(
  defineProps<{
    glass?: VeyGlassValue;
    modelValue: boolean;
    title?: string;
    width?: string;
    closeOnOverlay?: boolean;
  }>(),
  {
    glass: undefined,
    title: "",
    width: "420px",
    closeOnOverlay: true,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "close"): void;
}>();

const drawerStyle = computed(() => ({ width: props.width }));
const panelRef = ref<HTMLElement | null>(null);
const titleId = `vl-drawer-title-${Math.random().toString(36).slice(2)}`;
let deactivate: (() => void) | undefined;

const closeDrawer = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleOverlayClick = () => {
  if (!props.closeOnOverlay) return;
  closeDrawer();
};
watch(
  () => props.modelValue,
  async (visible) => {
    deactivate?.();
    deactivate = undefined;
    if (visible) {
      await nextTick();
      if (panelRef.value)
        deactivate = activateModalLifecycle(panelRef.value, closeDrawer);
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => deactivate?.());
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <Teleport to="body">
    <Transition name="vl-drawer-fade">
      <div
        v-if="props.modelValue"
        class="vl-drawer-overlay"
        v-bind="$attrs"
        @click.self="handleOverlayClick"
      >
        <div
          ref="panelRef"
          v-glass
          class="vl-drawer-panel"
          :style="drawerStyle"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <div class="vl-drawer-header" data-slot="header">
            <h3 :id="titleId" class="vl-drawer-title">{{ props.title }}</h3>
            <button
              type="button"
              class="vl-drawer-close-btn"
              aria-label="Close drawer"
              @click="closeDrawer"
            >
              ×
            </button>
          </div>
          <div class="vl-drawer-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="vl-drawer-footer" data-slot="footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vl-drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--vdl-bg-backdrop);
  display: flex;
  justify-content: flex-end;
  z-index: var(--vdl-z-index-modal);
}

.vl-drawer-panel {
  height: 100%;
  background: var(--vdl-bg-panel);
  box-shadow: var(--vdl-shadow-panel);
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--vdl-border-strong);
}

.vl-drawer-header {
  padding: var(--vdl-space-4) var(--vdl-space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--vdl-border-subtle);
  background: var(--vdl-bg-muted);
}

.vl-drawer-title {
  margin: 0;
  font-size: var(--vdl-font-subtitle);
  font-weight: 600;
  color: var(--vdl-text-primary);
}

.vl-drawer-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--vdl-text-muted);
  line-height: 1;
  transition: color 0.2s;
}

.vl-drawer-close-btn:hover {
  color: var(--vdl-text-primary);
}

.vl-drawer-body {
  padding: var(--vdl-space-5);
  flex: 1;
  overflow-y: auto;
  color: var(--vdl-text-primary);
}

.vl-drawer-footer {
  padding: var(--vdl-space-4) var(--vdl-space-5);
  border-top: 1px solid var(--vdl-border-subtle);
  background: var(--vdl-bg-muted);
  display: flex;
  justify-content: flex-end;
  gap: var(--vdl-space-3);
}

/* 过渡动画 */
.vl-drawer-fade-enter-active,
.vl-drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.vl-drawer-fade-enter-from,
.vl-drawer-fade-leave-to {
  opacity: 0;
}

.vl-drawer-fade-enter-active .vl-drawer-panel,
.vl-drawer-fade-leave-active .vl-drawer-panel {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.vl-drawer-fade-enter-from .vl-drawer-panel,
.vl-drawer-fade-leave-to .vl-drawer-panel {
  transform: translateX(100%);
}
</style>
