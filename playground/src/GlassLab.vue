<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { glassTokens } from "@veydeck/tokens/glass";
import {
  VeyButton,
  VeyCard,
  VeySelect,
  VeyGlassProvider,
  VeyGlassSurface,
  VeyInput,
  VeySwitch,
  VeyCheckbox,
  VeyTabs,
  VeyDialog,
  VeyTable,
  VeyActionMenu,
  VeyTooltip,
  type VeyGlassOptions,
} from "@veydeck/vue";

const controls = ref<Required<VeyGlassOptions>>({
  intensity: 1,
  refraction: Number(glassTokens["--vdl-glass-control-refraction"]),
  blur: Number(glassTokens["--vdl-glass-control-blur"]),
  opacity: Number(glassTokens["--vdl-glass-control-opacity"]),
  highlight: Number(glassTokens["--vdl-glass-control-highlight"]),
});
const advanced = ref(false);
const enabled = ref(true);
const dark = ref(false);
watchEffect(() =>
  document.documentElement.setAttribute(
    "data-theme",
    dark.value ? "dark" : "light",
  ),
);
const selected = ref<string | number | null>("a");
const options = [
  { label: "节点 Alpha", value: "a" },
  { label: "节点 Beta", value: "b" },
];
const glass = computed(() =>
  enabled.value
    ? advanced.value
      ? controls.value
      : { intensity: controls.value.intensity }
    : false,
);
const labels = {
  intensity: "整体强度",
  refraction: "折射",
  blur: "模糊",
  opacity: "底色不透明度",
  highlight: "高光",
};
const draft = ref("连接配置草稿");
const checked = ref(true);
const tab = ref("overview");
const dialog = ref(false);
const many = ref(false);
const mounted = ref(true);
const actions = [
  {
    label: "查看详情",
    handler: () => {
      dialog.value = true;
    },
  },
];
const rows = [
  { name: "Alpha", status: "在线" },
  { name: "Beta", status: "等待" },
];
const columns = [
  { prop: "name", label: "节点" },
  { prop: "status", label: "状态" },
];
</script>

<template>
  <main
    class="glass-lab"
    data-page="glass-lab"
    :data-theme="dark ? 'dark' : 'light'"
  >
    <header>
      <h1>Liquid Glass · Vue</h1>
      <p>材质接口演示。滑块与偏好由消费应用实现。</p>
      <a href="/">全部组件</a>
    </header>
    <div class="glass-lab-layout">
      <aside aria-label="材质参数">
        <label><input v-model="enabled" type="checkbox" />启用玻璃</label>
        <label><input v-model="dark" type="checkbox" />深色主题</label>
        <label><input v-model="advanced" type="checkbox" />独立参数覆盖</label>
        <label><input v-model="many" type="checkbox" />多实例压力场景</label>
        <label><input v-model="mounted" type="checkbox" />挂载演示组件</label>
        <label v-for="(label, key) in labels" :key="key">
          {{ label }} <output>{{ controls[key].toFixed(2) }}</output>
          <input
            v-model.number="controls[key]"
            :aria-label="label"
            type="range"
            min="0"
            max="1"
            step="0.01"
            :disabled="key !== 'intensity' && !advanced"
          />
        </label>
        <pre>{{ JSON.stringify(glass, null, 2) }}</pre>
      </aside>
      <VeyGlassProvider v-if="mounted" :glass="glass">
        <div class="glass-stage" data-ui="glass-stage">
          <div class="glass-background" aria-hidden="true">
            Veydeck<br />ALPHA 01<br />OBSERVABILITY<br />0123456789
          </div>
          <div class="glass-examples">
            <VeyGlassSurface
              as="section"
              class="custom-shell"
              data-ui="glass-surface"
            >
              自绘产品壳层
            </VeyGlassSurface>
            <VeyButton data-ui="glass-button"
              ><span class="foreground-probe" data-ui="foreground-probe"
                >保存配置</span
              ></VeyButton
            >
            <VeyButton type="primary">主要操作</VeyButton>
            <VeyButton :glass="false">实色覆盖</VeyButton>
            <VeyCard data-ui="glass-card"
              ><template #header>节点状态</template>连接正常 ·
              192.168.1.10</VeyCard
            >
            <VeySelect
              v-model="selected"
              :options="options"
              aria-label="选择节点"
              data-ui="glass-select"
            />
            <VeyInput v-model="draft" aria-label="配置草稿" />
            <div class="glass-control-row">
              <VeySwitch v-model="checked" active-text="自动连接" /><VeyCheckbox
                v-model="checked"
                >已选择</VeyCheckbox
              >
            </div>
            <VeyTabs
              v-model="tab"
              :tabs="[
                { name: 'overview', label: '概览' },
                { name: 'settings', label: '设置' },
              ]"
            />
            <div class="glass-control-row">
              <VeyActionMenu :actions="actions" label="更多操作" /><VeyTooltip
                text="浮层继承材质与主题"
                ><VeyButton @click="dialog = true"
                  >打开详情</VeyButton
                ></VeyTooltip
              >
            </div>
            <VeyTable :data="rows" :columns="columns" />
            <div v-if="many" class="glass-stress" data-ui="glass-stress">
              <VeyButton v-for="n in 24" :key="n">节点 {{ n }}</VeyButton>
            </div>
          </div>
        </div>
        <VeyDialog :visible="dialog" title="节点详情" @close="dialog = false"
          ><VeyInput v-model="draft" aria-label="详情草稿" />
          <p>材质调整保留输入、焦点与浮层状态。</p></VeyDialog
        >
      </VeyGlassProvider>
    </div>
  </main>
</template>

<style scoped>
.glass-lab {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px;
  background: var(--vdl-bg-canvas);
  color: var(--vdl-text-primary);
  font-family: var(--vdl-font-family);
}
header {
  margin-bottom: 24px;
}
h1 {
  font-size: 24px;
}
a {
  color: var(--vdl-primary);
}
.glass-lab-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 24px;
}
aside {
  background: var(--vdl-bg-base);
  padding: 16px;
  border-radius: 12px;
}
label {
  display: block;
  margin-bottom: 16px;
}
input[type="range"] {
  width: 100%;
  accent-color: var(--vdl-primary);
}
output {
  float: right;
  font-family: var(--vdl-font-mono);
}
pre {
  white-space: pre-wrap;
  font-size: 12px;
}
.glass-stage {
  position: relative;
  min-height: 640px;
  overflow: auto;
  border-radius: 20px;
  background-color: var(--vdl-bg-panel);
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent 0 23px,
      var(--vdl-border-strong) 23px 24px
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0 23px,
      var(--vdl-border-strong) 23px 24px
    );
}
.glass-background {
  position: absolute;
  inset: 24px;
  font-size: clamp(24px, 4vw, 60px);
  line-height: 2;
  font-weight: 800;
  color: var(--vdl-primary);
}
.glass-examples {
  position: relative;
  display: grid;
  gap: 32px;
  margin: 60px auto;
  width: min(360px, 85%);
}

.custom-shell {
  padding: 20px;
  border-radius: var(--vdl-radius-lg);
}
.glass-examples > .vl-button {
  height: 56px;
  border-radius: 18px;
}
.foreground-probe {
  background: var(--vdl-bg-base);
  color: var(--vdl-text-primary);
  padding: 2px 6px;
  border-radius: 4px;
}
.glass-control-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.glass-stress {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
@media (max-width: 640px) {
  .glass-lab {
    padding: 12px;
  }
  .glass-lab-layout {
    grid-template-columns: 1fr;
  }
}
</style>
