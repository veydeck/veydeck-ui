<script setup lang="ts">
import { computed } from "vue";
import { getIcon } from "@veydeck/icons";
import type { IconNamespace } from "@veydeck/icons";

interface Props {
  name?: string | null;
  namespace?: IconNamespace;
  size?: number | string;
  label?: string;
  decorative?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  name: "fallback",
  namespace: "common",
  size: 24,
  label: "",
  decorative: true,
});

const iconName = computed(() => {
  const normalized = (props.name ?? "").trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(normalized) ? normalized : "fallback";
});

const iconSource = computed(() => getIcon(iconName.value, props.namespace));
const iconSize = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size,
);
</script>

<template>
  <span
    class="vl-icon"
    :style="{ '--vl-icon-size': iconSize }"
    :aria-hidden="decorative ? 'true' : undefined"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : label || iconName"
    v-html="iconSource"
  ></span>
</template>

<style scoped>
.vl-icon {
  width: var(--vl-icon-size);
  height: var(--vl-icon-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 1;
  flex-shrink: 0;
}

.vl-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
