<script setup lang="ts">
import type { VeyGlassProfile, VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";

/**
 * @file VeyGlassSurface.vue
 * @description 为产品壳层和自绘区域提供无业务布局的通用玻璃材质容器。
 */
interface Props {
  /** 根元素标签。 */
  as?: string;
  /** 共享材质预设。 */
  profile?: VeyGlassProfile;
  /** 局部材质配置；省略时继承 Provider。 */
  glass?: VeyGlassValue;
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
  profile: "surface",
  glass: undefined,
});

const vGlass = useGlass(() => props.glass, props.profile);
</script>

<template>
  <component
    :is="as"
    v-glass
    class="vl-glass-surface"
    :data-glass-profile="profile"
  >
    <slot></slot>
  </component>
</template>

<style scoped>
.vl-glass-surface {
  --vl-glass-tint: var(--vdl-glass-surface-tint);

  border: 1px solid var(--vdl-glass-border);
  box-shadow: var(--vdl-glass-shadow);
}

.vl-glass-surface[data-glass-profile="control"] {
  --vl-glass-tint: var(--vdl-glass-control-tint);

  box-shadow: none;
}

.vl-glass-surface[data-glass-profile="input"] {
  --vl-glass-tint: var(--vdl-glass-input-tint);

  box-shadow: none;
}
</style>
