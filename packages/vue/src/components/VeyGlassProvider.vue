<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
} from "vue";
import { glassContext, type VeyGlassValue } from "../glass";
import { observeGlassTokens } from "../internal/glass-tokens";

const props = withDefaults(defineProps<{ glass?: VeyGlassValue }>(), {
  glass: undefined,
});
const parent = inject(glassContext, undefined);
const root = ref<HTMLElement>();
const theme = ref<string>();
const tokens = ref<Record<string, string>>({});
let stopTokens: (() => void) | undefined;
provide(glassContext, {
  value: computed(() => props.glass ?? parent?.value.value),
  theme: computed(() => theme.value ?? parent?.theme.value),
  tokens: computed(() => tokens.value),
  scope: computed(() => root.value),
});
onMounted(() => {
  const read = () => {
    theme.value =
      root.value?.closest("[data-theme]")?.getAttribute("data-theme") ??
      undefined;
    if (root.value) {
      const style = getComputedStyle(root.value);
      const next: Record<string, string> = {};
      for (let i = 0; i < style.length; i++) {
        const property = style.item(i);
        if (property.startsWith("--vdl-"))
          next[property] = style.getPropertyValue(property);
      }
      if (JSON.stringify(tokens.value) !== JSON.stringify(next))
        tokens.value = next;
    }
  };
  read();
  if (root.value) stopTokens = observeGlassTokens(root.value, read);
});
onBeforeUnmount(() => stopTokens?.());
</script>

<template>
  <div ref="root" style="display: contents" data-ui="glass-provider">
    <slot />
  </div>
</template>
