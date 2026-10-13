<script setup lang="ts">
import { inject } from "vue";

/**
 * @file VeyBreadcrumbItem.vue
 * @description Veydeck 平台自研面包屑导航项。
 */

const separator = inject("vl-breadcrumb-separator", "/");
</script>

<template>
  <span class="vl-breadcrumb-item">
    <span class="vl-breadcrumb-label">
      <slot></slot>
    </span>
    <span class="vl-breadcrumb-separator" role="presentation">{{
      separator
    }}</span>
  </span>
</template>

<style scoped>
.vl-breadcrumb-item {
  display: inline-flex;
  align-items: center;
}

.vl-breadcrumb-item:last-child .vl-breadcrumb-separator {
  display: none;
}

.vl-breadcrumb-label {
  color: var(--vdl-text-secondary);
  transition: color 0.2s;
}

.vl-breadcrumb-label:hover {
  color: var(--vdl-primary);
}

.vl-breadcrumb-separator {
  margin: 0 var(--vdl-space-2);
  color: var(--vdl-text-muted);
  user-select: none;
}
</style>
