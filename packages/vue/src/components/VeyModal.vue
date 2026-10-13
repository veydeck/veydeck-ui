<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { activateModalLifecycle } from "../internal/modal-lifecycle";
defineOptions({
  inheritAttrs: false,
});
/**
 * @file VeyModal.vue
 * @description Veydeck 平台自研通用模态框组件，支持确认、信息展示及自定义操作。
 */

interface Props {
  glass?: VeyGlassValue;
  /** 是否可见 */
  visible: boolean;
  /** 标题 */
  title: string;
  /** 消息内容 */
  message: string;
  /** 确认按钮文案 */
  confirmText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 确认按钮类型 */
  type?: "primary" | "danger" | "warning";
}

const props = withDefaults(defineProps<Props>(), {
  glass: undefined,
  confirmText: "确定",
  cancelText: "取消",
  type: "primary",
});

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
const cardRef = ref<HTMLElement | null>(null);
const titleId = `vl-modal-title-${Math.random().toString(36).slice(2)}`;
let deactivate: (() => void) | undefined;
watch(
  () => props.visible,
  async (visible) => {
    deactivate?.();
    deactivate = undefined;
    if (visible) {
      await nextTick();
      if (cardRef.value)
        deactivate = activateModalLifecycle(cardRef.value, () =>
          emit("cancel"),
        );
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => deactivate?.());
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <Teleport to="body">
    <Transition name="vl-modal-fade">
      <div
        v-if="visible"
        class="vl-modal-overlay"
        v-bind="$attrs"
        @click.self="emit('cancel')"
      >
        <div
          ref="cardRef"
          v-glass
          class="vl-modal-card"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <div class="vl-modal-header" data-slot="header">
            <h3 :id="titleId" class="vl-modal-title">{{ title }}</h3>
          </div>
          <div class="vl-modal-body">
            <p class="vl-modal-message">{{ message }}</p>
          </div>
          <div class="vl-modal-footer" data-slot="footer">
            <button
              type="button"
              class="vl-modal-btn is-cancel"
              @click="emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              class="vl-modal-btn"
              type="button"
              :class="[`is-${type}`]"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vl-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--vdl-bg-backdrop);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--vdl-z-index-modal);
}

.vl-modal-card {
  background: var(--vdl-bg-panel);
  border-radius: var(--vdl-radius-lg);
  border: 1px solid var(--vdl-border-strong);
  box-shadow: var(--vdl-shadow-window);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  animation: vl-modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vl-modal-header {
  padding: var(--vdl-space-4) var(--vdl-space-5);
  background-color: var(--vdl-bg-muted);
  border-bottom: 1px solid var(--vdl-border-subtle);
}

.vl-modal-title {
  margin: 0;
  font-size: var(--vdl-font-subtitle);
  font-weight: 600;
  color: var(--vdl-text-primary);
}

.vl-modal-body {
  padding: var(--vdl-space-6) var(--vdl-space-5);
  color: var(--vdl-text-secondary);
}

.vl-modal-message {
  margin: 0;
  line-height: 1.6;
  font-size: var(--vdl-font-body);
}

.vl-modal-footer {
  padding: var(--vdl-space-4) var(--vdl-space-5);
  display: flex;
  justify-content: flex-end;
  gap: var(--vdl-space-3);
  background-color: var(--vdl-bg-muted);
  border-top: 1px solid var(--vdl-border-subtle);
}

.vl-modal-btn {
  height: 36px;
  min-width: 88px;
  padding: 0 var(--vdl-space-4);
  border-radius: var(--vdl-radius-md);
  border: 1px solid transparent;
  font-size: var(--vdl-font-body-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.vl-modal-btn.is-cancel {
  background-color: transparent;
  border-color: var(--vdl-border-default);
  color: var(--vdl-text-secondary);
}
.vl-modal-btn.is-cancel:hover {
  background-color: var(--vdl-bg-hover);
  color: var(--vdl-text-primary);
}

.vl-modal-btn.is-primary {
  background-color: var(--vdl-primary);
  color: var(--vdl-text-inverse);
}
.vl-modal-btn.is-primary:hover {
  background-color: var(--vdl-primary-hover);
}

.vl-modal-btn.is-danger {
  background-color: var(--vdl-danger);
  color: var(--vdl-text-on-danger);
}
.vl-modal-btn.is-danger:hover {
  filter: brightness(1.1);
}

/* 过渡动画 */
.vl-modal-fade-enter-active,
.vl-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.vl-modal-fade-enter-from,
.vl-modal-fade-leave-to {
  opacity: 0;
}

@keyframes vl-modal-pop {
  from {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
