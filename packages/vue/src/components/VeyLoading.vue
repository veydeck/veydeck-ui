<script setup lang="ts">
/**
 * @file VeyLoading.vue
 * @description Veydeck 平台自研加载遮罩组件，严格遵循 VDL 设计规范。
 */

interface Props {
  /** 是否显示加载中 */
  loading: boolean;
  /** 提示文字 */
  text?: string;
  /** 是否覆盖父容器 */
  cover?: boolean;
}

defineProps<Props>();
</script>

<template>
  <div
    class="vl-loading-host"
    :class="{ 'is-cover': cover, 'is-loading': loading }"
    :aria-busy="loading"
  >
    <slot></slot>
    <Transition name="vl-loading-fade">
      <div
        v-if="loading"
        class="vl-loading-mask"
        role="status"
        aria-live="polite"
      >
        <div class="vl-loading-spinner">
          <svg class="vl-spinner" viewBox="0 0 50 50">
            <circle
              class="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="5"
            ></circle>
          </svg>
          <p v-if="text" class="vl-loading-text">{{ text }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.vl-loading-host {
  position: relative;
  width: 100%;
  min-width: 0;
  border-radius: var(--vdl-radius-md);
}

.vl-loading-host.is-loading {
  min-height: 120px;
}

.vl-loading-host.is-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  min-height: 0;
}

.vl-loading-host.is-cover.is-loading {
  pointer-events: auto;
  z-index: var(--vdl-z-index-window);
}

.vl-loading-mask {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--vdl-bg-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  backdrop-filter: blur(2px);
}

.vl-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--vdl-space-3);
}

.vl-spinner {
  animation: rotate 2s linear infinite;
  width: 42px;
  height: 42px;
  color: var(--vdl-primary);
}

.vl-spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.vl-loading-text {
  margin: 0;
  font-size: var(--vdl-font-body-sm);
  color: var(--vdl-text-primary);
  font-weight: 500;
  white-space: nowrap;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.vl-loading-fade-enter-active,
.vl-loading-fade-leave-active {
  transition: opacity 0.3s;
}

.vl-loading-fade-enter-from,
.vl-loading-fade-leave-to {
  opacity: 0;
}
</style>
