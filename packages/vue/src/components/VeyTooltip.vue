<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";

/**
 * @file VeyTooltip.vue
 * @description Veydeck 平台自研文字提示组件，严格遵循 VDL 设计规范。
 */

type TooltipPosition = "top" | "bottom" | "left" | "right";

const props = withDefaults(
  defineProps<{
    glass?: VeyGlassValue;
    /** 提示文字内容 */
    text: string;
    /** 显示位置 */
    position?: TooltipPosition;
    /** 显示延迟 (ms) */
    delay?: number;
    /** 是否禁用 */
    disabled?: boolean;
  }>(),
  {
    glass: undefined,
    position: "top",
    delay: 200,
    disabled: false,
  },
);

const isVisible = ref(false);
const tooltipStyle = ref({});
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipId = `vl-tooltip-${Math.random().toString(36).slice(2)}`;
const actualPosition = ref<TooltipPosition>(props.position);

let timer: number | undefined = undefined;

// --- 定位逻辑 ---

const calculatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 5;

  let top = 0;
  let left = 0;

  const triggerCenterY = triggerRect.top + triggerRect.height / 2;
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const offset = 8;

  let placement = props.position;
  const fits = (candidate: TooltipPosition) => {
    if (candidate === "top")
      return triggerRect.top - tooltipRect.height - offset >= margin;
    if (candidate === "bottom")
      return (
        triggerRect.bottom + tooltipRect.height + offset <=
        viewportHeight - margin
      );
    if (candidate === "left")
      return triggerRect.left - tooltipRect.width - offset >= margin;
    return (
      triggerRect.right + tooltipRect.width + offset <= viewportWidth - margin
    );
  };
  const opposite: Record<TooltipPosition, TooltipPosition> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  if (!fits(placement) && fits(opposite[placement]))
    placement = opposite[placement];
  actualPosition.value = placement;

  switch (placement) {
    case "top":
    case "bottom":
      top =
        placement === "top"
          ? triggerRect.top - tooltipRect.height - offset
          : triggerRect.bottom + offset;
      left = triggerCenterX - tooltipRect.width / 2;

      if (left < margin) left = margin;
      const rightEdge = left + tooltipRect.width;
      const viewportRight = viewportWidth - margin;

      if (rightEdge > viewportRight) {
        left = Math.max(margin, left - (rightEdge - viewportRight));
      }
      break;

    case "left":
    case "right":
      top = triggerCenterY - tooltipRect.height / 2;
      left =
        placement === "left"
          ? triggerRect.left - tooltipRect.width - offset
          : triggerRect.right + offset;
      break;
  }

  top = Math.min(
    Math.max(top, margin),
    Math.max(margin, viewportHeight - margin - tooltipRect.height),
  );
  left = Math.min(
    Math.max(left, margin),
    Math.max(margin, viewportWidth - margin - tooltipRect.width),
  );
  tooltipStyle.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
  };
};

// --- 悬浮控制逻辑 ---

const handleMouseEnter = () => {
  if (props.disabled) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    isVisible.value = true;
    nextTick(() => {
      calculatePosition();
    });
  }, props.delay) as unknown as number;
};

watch(
  () => props.disabled,
  (disabled) => {
    if (!disabled) return;
    clearTimeout(timer);
    isVisible.value = false;
  },
);

const handleMouseLeave = () => {
  clearTimeout(timer);
  isVisible.value = false;
};

onMounted(() => {
  window.addEventListener("resize", calculatePosition);
  window.addEventListener("scroll", calculatePosition, true);
});

onUnmounted(() => {
  clearTimeout(timer);
  window.removeEventListener("resize", calculatePosition);
  window.removeEventListener("scroll", calculatePosition, true);
});
const vGlass = useGlass(() => props.glass, "surface");
</script>

<template>
  <div
    class="vl-tooltip-wrapper"
    ref="triggerRef"
    :aria-describedby="isVisible && text && !disabled ? tooltipId : undefined"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
    <teleport to="body">
      <Transition name="vl-tooltip-fade">
        <div
          v-if="isVisible && text && !disabled"
          ref="tooltipRef"
          :id="tooltipId"
          v-glass
          class="vl-tooltip-content"
          role="tooltip"
          :style="tooltipStyle"
          :data-position="actualPosition"
        >
          {{ text }}
          <span class="vl-tooltip-arrow" :data-position="actualPosition"></span>
        </div>
      </Transition>
    </teleport>
  </div>
</template>

<style scoped>
.vl-tooltip-wrapper {
  display: inline-block;
}

.vl-tooltip-content {
  z-index: var(--vdl-z-index-modal); /* 使用规范的 Z-Index */
  position: fixed;
  background-color: var(--vdl-bg-panel);
  color: var(--vdl-text-primary);
  padding: var(--vdl-space-1) var(--vdl-space-3);
  border-radius: var(--vdl-radius-sm);
  font-size: var(--vdl-font-caption);
  white-space: nowrap;
  box-shadow: var(--vdl-shadow-panel);
  border: 1px solid var(--vdl-border-strong);
  pointer-events: none;
  line-height: 1.6;
}

.vl-tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-width: 5px;
  border-style: solid;
}

.vl-tooltip-arrow[data-position="top"] {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-color: var(--vdl-border-strong) transparent transparent transparent;
}

.vl-tooltip-arrow[data-position="bottom"] {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-color: transparent transparent var(--vdl-border-strong) transparent;
}

.vl-tooltip-arrow[data-position="left"] {
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border-color: transparent transparent transparent var(--vdl-border-strong);
}

.vl-tooltip-arrow[data-position="right"] {
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border-color: transparent var(--vdl-border-strong) transparent transparent;
}

.vl-tooltip-fade-enter-active,
.vl-tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.vl-tooltip-fade-enter-from,
.vl-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
