# @veydeck/tokens

Veydeck Design Language（VDL）主题变量包，为 Veydeck 前端项目提供统一的颜色、字体、间距、圆角、阴影和层级定义。

## 安装

```bash
pnpm add @veydeck/tokens
```

## 使用

在应用的全局样式入口导入：

```css
@import "@veydeck/tokens/index.css";
```

业务样式通过 `--vdl-*` 变量引用：

```css
.panel {
  color: var(--vdl-text-primary);
  background: var(--vdl-bg-panel);
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-md);
  padding: var(--vdl-space-4);
}
```

## 主题

默认主题为浅色，无需设置主题属性。需要显式声明时使用：

```html
<html data-theme="light"></html>
```

切换到深色主题：

```html
<html data-theme="dark"></html>
```

消费项目专属的图片、字体和其他静态资源路径不属于公共 Token，应由消费项目自行定义。

## 主要变量

- 背景：`--vdl-bg-*`
- 文本：`--vdl-text-*`
- 品牌与状态：`--vdl-primary`、`--vdl-success`、`--vdl-warning`、`--vdl-danger`
- 边框：`--vdl-border-*`
- 字体：`--vdl-font-*`
- 间距：`--vdl-space-*`
- 圆角：`--vdl-radius-*`
- 层级：`--vdl-z-index-*`
- 滚动条：`--vdl-scrollbar-*`

## Liquid Glass 共享材质

`index.css` 自动包含 `glass.css`。材质 Token 只声明参数，不会改变原有 `--vdl-bg-*` 的含义。Vue 与 React 组件均已接入；其他项目可独立接入。

```css
:root {
  --vdl-glass-control-opacity: 0.7;
  --vdl-glass-refraction-max: 24px;
}

html[data-theme="dark"] {
  --vdl-glass-control-opacity: 0.6;
}

/* 局部作用域；可放在 VeyGlassProvider 上或其祖先上 */
.compact-console {
  --vdl-glass-blur-max: 12px;
}
```

| Token                                                                     | 默认值 / 含义                                 |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| `--vdl-glass-{control,surface,input}-tint`                                | 三类材质的共享底色色调                        |
| `--vdl-glass-{control,surface,input}-{refraction,blur,opacity,highlight}` | 三类材质的 0–1 预设，完整值见 `src/glass.css` |
| `--vdl-glass-border` / `--vdl-glass-border-hover`                         | 材质默认边缘与交互边缘                        |
| `--vdl-glass-shadow`                                                      | 通用浮层材质阴影                              |
| `--vdl-glass-blur-max`                                                    | `20px`，模糊值为 1 时的半径                   |
| `--vdl-glass-refraction-max`                                              | `28px`，折射值为 1 时的 SVG 位移尺度          |
| `--vdl-glass-rim-width`                                                   | `12px`，曲面折射边缘宽度                      |
| `--vdl-glass-saturation`                                                  | `1.12`，背景饱和度倍率                        |
| `--vdl-glass-highlight-scale`                                             | `0.5`，高光最大透明度                         |
| `--vdl-glass-highlight-color`                                             | `255 255 255`，高光 RGB 通道                  |
| `--vdl-glass-sheen-angle` / `--vdl-glass-sheen-stop`                      | `145deg` / `42%`，高光方向和衰减位置          |
| `--vdl-glass-sheen-tail-opacity` / `--vdl-glass-rim-bottom-opacity`       | `0.22` / `0.35`，高光相对系数                 |
| `--vdl-glass-semantic-opacity-min`                                        | `85%`，重要语义色底色下限                     |
| `--vdl-glass-header-opacity` / `--vdl-glass-content-opacity`              | `55%` / `25%`，容器内部衬底                   |
| `--vdl-glass-press-scale`                                                 | `0.98`，按压缩放                              |

材质颜色沿用 VDL 背景、品牌和状态 Token，继续跟随已有明暗主题；光学参数也可在主题作用域覆盖。只需材质声明时，可单独导入 `@veydeck/tokens/glass.css`。

主控或套件可在作用域根节点设置 `data-glass="disabled"`。该公共降级会关闭三类材质的折射、模糊和高光，并恢复不透明底色；框架组件仍负责释放自身的运行时滤镜资源。

## 滚动条玻璃材质

`index.css` 同时自动包含 `scrollbar.css`，为普通滚动容器、Vue/React 组件以及嵌入套件提供一致的轨道、滑块、悬浮、按压和强制颜色样式。只需要滚动条配方时可单独导入：

```css
@import "@veydeck/tokens/scrollbar.css";
```

常用覆盖项包括 `--vdl-scrollbar-size`、`--vdl-scrollbar-track`、`--vdl-scrollbar-thumb`、`--vdl-scrollbar-thumb-hover` 和 `--vdl-scrollbar-thumb-active`。`data-glass="disabled"` 会自动切换为无高光的实色降级配方。

原生滚动条伪元素无法接入组件的 SVG 折射渲染器，因此这里提供半透明色调、曲面高光和内缘层次；Firefox 使用 `scrollbar-color` 的简化表现。Monaco 等自绘滚动条应读取相同 Token，不应复制硬编码颜色。

### CSS 与 JS 的单一来源

`src/glass.css` 是唯一默认值来源。构建生成框架无关的 JS 兜底值及类型：

```ts
import { glassTokens } from "@veydeck/tokens/glass";

// 构建时默认值，不是用户当前 CSS 覆盖后的值。
const fallback = glassTokens["--vdl-glass-refraction-max"];
```

渲染器读取组件元素 `getComputedStyle()` 的实际 Token，缺失或无效时才使用生成值。不要另写默认参数表或修改 `dist/`。

Vue 与 React 的数值预设接受 0–1 数字；光学长度使用 `px`（零可写 `0`），饱和度为数字。支持 `var()` 引用最终解析为这些值；JS 光学参数暂不接受 `calc()`、`rem` 或百分比。无效值回退默认值。两套渲染器对模糊、位移、边缘宽度和饱和度分别设置 80px、100px、64px、3 的保护上限。

两套组件库在初次加载、祖先 `style`/`class`/`data-theme` 变化、样式元素更新及样式表加载时读取材质，不做持续轮询。直接使用 CSSOM `insertRule()` 等 API 时，应同时更新作用域 class/style 以触发重读。Teleport/Portal 浮层通过 Provider 携带作用域 Token。

构建：`pnpm --filter @veydeck/tokens build`。组件的显式 `glass` 参数优先于 Token 预设；`--vl-glass-*` 属于框架组件内部渲染状态，不是共享接口。
