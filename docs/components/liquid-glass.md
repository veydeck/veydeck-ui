# Liquid Glass

`@veydeck/vue` 与 `@veydeck/react` 对适用表面提供一致的 Liquid Glass 材质能力。共享色调、光学参数和降级配方由 `@veydeck/tokens` 的 `--vdl-glass-*` Token 定义；两套组件库分别使用同等语义的渲染器、Provider 和 Surface。

适用组件默认启用材质。`glass` 用于覆盖配置或关闭效果，不需要逐个传入 `true`。设置界面、用户偏好和持久化由消费项目负责。

## 使用

Vue：

```vue
<script setup lang="ts">
import { VeyButton, VeyGlassProvider, VeyGlassSurface } from "@veydeck/vue";
import "@veydeck/tokens/index.css";
import "@veydeck/vue/style.css";
</script>

<template>
  <VeyGlassProvider :glass="{ intensity: 0.8 }">
    <VeyGlassSurface as="section" profile="surface">
      自绘应用壳层
    </VeyGlassSurface>
    <VeyButton>继承材质</VeyButton>
    <VeyButton :glass="false">局部实色</VeyButton>
  </VeyGlassProvider>
</template>
```

React：

```tsx
import { VeyButton, VeyGlassProvider, VeyGlassSurface } from "@veydeck/react";
import "@veydeck/tokens/index.css";
import "@veydeck/react/style.css";

export function Shell() {
  return (
    <VeyGlassProvider glass={{ intensity: 0.8 }}>
      <VeyGlassSurface as="section" profile="surface">
        自绘应用壳层
      </VeyGlassSurface>
      <VeyButton>继承材质</VeyButton>
      <VeyButton glass={false}>局部实色</VeyButton>
    </VeyGlassProvider>
  );
}
```

`VeyGlassSurface` 仅提供材质，不附带业务间距或布局。`as` 默认是 `div`，`profile` 可选 `control`、`surface` 或 `input`。

## 公共契约

```ts
interface VeyGlassOptions {
  intensity?: number;
  refraction?: number;
  blur?: number;
  opacity?: number;
  highlight?: number;
}

type VeyGlassValue = boolean | VeyGlassOptions;
type VeyGlassProfile = "control" | "surface" | "input";
type VeyGlassMode = "refraction" | "blur" | "solid";
```

适用组件接受 `glass?: VeyGlassValue`。所有数值都归一化到 0–1；超出范围的有限值会被截断，非有限值和无效值使用对应 profile 的默认值。

- 省略：继承最近的 Provider，否则使用组件默认 profile。
- `false`：关闭玻璃效果并使用不透明材质；这不是旧主题的逐像素复刻。
- `true`：显式使用组件默认材质。
- 对象：替换当前组件继承的配置；未提供字段使用组件 profile，而不是与 Provider 对象逐字段合并。
- `intensity`：在实色表面（`0`）和 profile 默认效果（`1`）之间插值；独立字段会覆盖对应插值结果。
- `refraction`：圆角边缘位移，最大 SVG 位移尺度由 Token 控制。
- `blur`：背景模糊强度。
- `opacity`：材质底色色调的不透明度，不改变文字、图标或整个元素的透明度。
- `highlight`：表面高光与边缘反射，不产生持续动画。

默认 profile 定义在 `@veydeck/tokens`，可在 CSS 作用域覆盖：

| Profile | Refraction | Blur | Opacity | Highlight |
| ------- | ---------: | ---: | ------: | --------: |
| Control |        0.5 | 0.18 |     0.3 |       0.6 |
| Surface |       0.35 | 0.35 |     0.3 |      0.45 |
| Input   |        0.2 |  0.2 |     0.3 |       0.3 |

`VeyGlassProvider` 统一管理子树材质。组件自身配置优先于 Provider，Provider 优先于默认 profile。Vue 使用默认插槽，React 使用 `children`；两端嵌套 Provider 的替换与继承语义一致。组件局部配置不会隐式传递给消费方插槽或 `children` 中的独立组件。

## 生效范围

| 组件                        | 材质区域                               |
| --------------------------- | -------------------------------------- |
| Button、Pagination          | 按钮表面                               |
| Switch                      | 滑块；轨道保留开关状态色               |
| Checkbox                    | 勾选表面，覆盖勾选、半选与禁用状态     |
| Tabs                        | 激活项                                 |
| Menu、SelectionBar          | 导航或选择容器                         |
| Select、ActionMenu          | 触发器及浮层菜单                       |
| DateTimeRangePicker         | 触发器及浮层面板                       |
| Tooltip、Toast              | 浮层内容或单条通知                     |
| Alert                       | 横幅表面及状态色调                     |
| Card、Dialog、Modal、Drawer | 外壳；内容保持可读，避免嵌套折射       |
| Input                       | 输入框或文本域边框表面                 |
| Table                       | 表格容器和选择控件；行与单元格保持清晰 |
| Descriptions                | 网格容器；值区域保持清晰               |

Icon、Breadcrumb/BreadcrumbItem、FormItem、Loading、Empty 和 Tag 不增加 `glass` 属性，继续使用原有内容或状态呈现。

公共滚动条材质由 `@veydeck/tokens` 的 `scrollbar.css` 提供。原生滚动条无法使用组件级 SVG 折射，因此通过半透明色调、高光和内缘层次保持一致视觉；Monaco 等自绘滚动条应消费相同 Token。

## 渲染与降级

渲染器只处理表面后方内容，文字和图标仍是普通 DOM 内容。Canvas 仅生成圆角矩形的位移图，不截取或复制业务 DOM。每个活动表面管理自己的 SVG 滤镜，尺寸变化时更新位移图，参数变化复用资源；组件卸载或关闭折射时会释放资源，静止状态没有持续动画循环。

Chrome 和 Edge 在能力检测通过后使用 SVG 背景折射；不支持时降级为 CSS 模糊。`data-glass-mode` 表示当前选择的 `refraction`、`blur` 或 `solid` 渲染路径，不是光学效果已经成功的证明。

减少透明度、强制颜色或 `glass={false}`/`:glass="false"` 会使用实色表面；减少动态效果会关闭材质过渡与按压形变。主控和套件还可以在根节点设置 `data-glass="disabled"`，统一使用 tokens 提供的实色降级配方。

Teleport/Portal 浮层会同步 Provider 的主题和公共 Token。主题作用域应覆盖 Provider；不要依赖浮层原始 DOM 位置的继承关系。

该效果参考现代液态玻璃的视觉语言，但不复刻原生系统合成器，也不自动采样背景亮度。宿主 CSP 需要允许渲染器生成的 `data:image/png` 位移图。

## 开发与验证

Vue 与 React playground 都提供普通组件页和 Glass Lab。启动后以终端输出的实际地址为准：

```sh
pnpm dev
pnpm dev:react
```

按目标框架运行检查：

```sh
pnpm check:vue
pnpm test:e2e:vue

pnpm check:react
pnpm test:e2e:react
```

验收应覆盖明暗主题、Provider 动态更新、局部关闭、浮层同步、键盘焦点、窄容器、减少透明度、强制颜色、资源卸载和静止状态。真实折射需要在有细节的背景上比较折射开启与关闭结果，并确认前景文字像素不受滤镜影响。
