<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { activateModalLifecycle } from "../internal/modal-lifecycle";

defineOptions({
  inheritAttrs: false,
});
/**
 * @file VeyDialog.vue
 * @description Veydeck 平台自研通用对话框 (子窗口) 组件，符合 VDL 设计规范，具有高密度与精致的悬浮工程感。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 对话框是否显示 */
  visible: boolean;
  /** 对话框标题 */
  title: string;
  /** 自定义宽度，支持 px 或百分比，默认值为 500px */
  width?: string;
  /** 点击遮罩层是否允许自动关闭对话框，默认为 true */
  closeOnClickOverlay?: boolean;
  /** 对话框遮罩层级，默认使用 VDL modal 层级 */
  zIndex?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  width: "500px",
  closeOnClickOverlay: true,
  zIndex: "var(--vdl-z-index-modal)",
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const overlayStyle = computed(() => ({
  zIndex: props.zIndex,
}));
const cardRef = ref<HTMLElement | null>(null);
const titleId = `vl-dialog-title-${Math.random().toString(36).slice(2)}`;
let deactivate: (() => void) | undefined;
watch(
  () => props.visible,
  async (visible) => {
    deactivate?.();
    deactivate = undefined;
    if (visible) {
      await nextTick();
      if (cardRef.value)
        deactivate = activateModalLifecycle(cardRef.value, () => emit("close"));
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => deactivate?.());
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <Teleport to="body">
    <Transition name="vl-dialog-fade">
      <div
        v-if="visible"
        class="vl-dialog-overlay"
        v-bind="$attrs"
        :style="overlayStyle"
        @click.self="closeOnClickOverlay ? emit('close') : undefined"
      >
        <div
          ref="cardRef"
          class="vl-dialog-card"
          :style="{ width, maxWidth: '95%' }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <div
            v-glass
            class="vl-dialog-glass-layer"
            aria-hidden="true"
            data-slot="glass-layer"
          ></div>

          <!-- 头部标题栏 -->
          <div class="vl-dialog-header" data-slot="header">
            <span :id="titleId" class="vl-dialog-title">{{ title }}</span>
            <button
              class="vl-dialog-close-btn"
              @click="emit('close')"
              aria-label="Close dialog"
            >
              &times;
            </button>
          </div>

          <!-- 主体内容承载区，默认带有溢出自动滚动 -->
          <div class="vl-dialog-body">
            <slot></slot>
          </div>

          <!-- 底部操作按钮栏，仅当传入 footer 插槽时渲染 -->
          <div v-if="$slots.footer" class="vl-dialog-footer" data-slot="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vl-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--vdl-bg-backdrop);
  backdrop-filter: none;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--vdl-z-index-modal);
}

.vl-dialog-card {
  position: relative;
  background-color: transparent;
  border-radius: var(--vdl-radius-lg);
  border: 1px solid var(--vdl-border-strong);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 85%;
  animation: vl-dialog-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.vl-dialog-glass-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background-color: var(--vdl-bg-panel);
  pointer-events: none;
}

.vl-dialog-header {
  position: relative;
  z-index: 1;
  padding: var(--vdl-space-4) var(--vdl-space-4);
  background-color: var(--vdl-bg-muted);
  border-bottom: 1px solid var(--vdl-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.vl-dialog-title {
  font-size: var(--vdl-font-subtitle);
  font-weight: 700;
  color: var(--vdl-text-primary);
  user-select: none;
}

.vl-dialog-close-btn {
  background: transparent;
  border: none;
  color: var(--vdl-text-muted);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 0 var(--vdl-space-1);
  transition: color 0.15s ease;
}

.vl-dialog-close-btn:hover {
  color: var(--vdl-text-primary);
}

.vl-dialog-body {
  position: relative;
  z-index: 1;
  padding: var(--vdl-space-4);
  overflow-y: auto;
  flex: 1;
  color: var(--vdl-text-secondary);
}

.vl-dialog-footer {
  position: relative;
  z-index: 1;
  padding: var(--vdl-space-4) var(--vdl-space-4);
  background-color: var(--vdl-bg-muted);
  border-top: 1px solid var(--vdl-border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: var(--vdl-space-3);
  flex-shrink: 0;
}

/* 缩放弹出式动画 */
@keyframes vl-dialog-pop {
  from {
    transform: scale(0.96) translateY(8px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* 渐变遮罩过度效果 */
.vl-dialog-fade-enter-active,
.vl-dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.vl-dialog-fade-enter-from,
.vl-dialog-fade-leave-to {
  opacity: 0;
}
</style>
