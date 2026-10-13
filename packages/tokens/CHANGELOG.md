# 版本日志

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0-alpha.1] - 2026-10-13

### Added

- 首次发布 `@veydeck/tokens` VDL 主题 Token，CSS 自定义属性统一使用 `--vdl-*` 前缀。
- 提供浅色与深色主题的颜色、文字、边框、状态和背景变量。
- 提供字体、间距、圆角、阴影、层级及桌面布局变量。
- 提供 `--vdl-glass-*` 共享材质预设与光学参数，支持材质底色、边缘、阴影和 `data-glass="disabled"` 实色降级。
- 提供 `glass.css` 独立样式入口及 `glass` JavaScript 与类型入口，便于跨框架共享材质配置。
- 提供公共滚动条样式及独立 CSS 入口，支持玻璃材质、交互状态和强制颜色模式。
