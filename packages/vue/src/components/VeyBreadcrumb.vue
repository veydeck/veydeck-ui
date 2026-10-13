<script setup lang="ts">
import { provide } from "vue";

/**
 * @file VeyBreadcrumb.vue
 * @description Veydeck 平台自研面包屑导航容器。
 */

interface Props {
  /** 分隔符 */
  separator?: string;
}

const props = withDefaults(defineProps<Props>(), {
  separator: "/",
});

provide("vl-breadcrumb-separator", props.separator);
</script>

<template>
  <nav class="vl-breadcrumb" aria-label="Breadcrumb">
    <slot></slot>
  </nav>
</template>

<style scoped>
.vl-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  font-size: var(--vdl-font-body-sm);
  color: var(--vdl-text-muted);
}
</style>
