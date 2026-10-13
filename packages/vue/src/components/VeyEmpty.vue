<script setup lang="ts">
/**
 * @file VeyEmpty.vue
 * @description Veydeck 平台自研空状态组件，严格遵循 VDL 设计规范。
 */

import VeyIcon from "./VeyIcon.vue";

interface Props {
  /** 描述文字 */
  description?: string;
  /** VDL 图标名称。 */
  icon?: string;
}

withDefaults(defineProps<Props>(), {
  description: "暂无数据",
  icon: "empty",
});
</script>

<template>
  <div class="vl-empty">
    <div class="vl-empty-icon">
      <slot name="icon">
        <VeyIcon :name="icon" :size="48" />
      </slot>
    </div>
    <p class="vl-empty-description">
      <slot>{{ description }}</slot>
    </p>
    <div v-if="$slots.extra" class="vl-empty-extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<style scoped>
.vl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--vdl-space-8) var(--vdl-space-4);
  text-align: center;
  box-sizing: border-box;
}

.vl-empty-icon {
  color: var(--vdl-text-muted);
  margin-bottom: var(--vdl-space-4);
  line-height: 1;
  opacity: 0.8;
}

.vl-empty-description {
  margin: 0;
  font-size: var(--vdl-font-body);
  color: var(--vdl-text-muted);
}

.vl-empty-extra {
  margin-top: var(--vdl-space-4);
}
</style>
