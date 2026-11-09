# Changelog

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- `VeyTooltip` 新增 `followCursor` 属性（默认 `false`），启用后以鼠标位置为基准定位并跟随移动，保留方向设置、显示延迟、边缘翻转和视口约束，支持动态切换。
- Tooltip 内部鼠标处理与传入的 `onMouseEnter`、`onMouseLeave`、`onMouseMove` 回调组合执行。

## [0.1.0-alpha.1] - 2026-10-13

### Added

- 首次发布 `@veydeck/react` React 19 基础组件库，组件统一使用 `Vey` 前缀和 VDL 主题 Token。
- 提供按钮、输入、选择、开关、复选框、日期范围和表单组件。
- 提供表格、分页、选择操作栏、标签、描述列表、卡片和空状态组件。
- 提供弹窗、抽屉、模态框、菜单、操作菜单、标签页和面包屑组件。
- 提供提示、通知、加载、告警和统一 SVG 图标组件。
- 适用组件默认支持 Liquid Glass 材质，可通过 `glass` 属性动态调整或关闭。
- 提供 `VeyGlassProvider`，统一管理材质并同步 Portal 浮层的主题与公共 Token。
- 提供 `VeyGlassSurface`，供产品壳层和套件自绘区域复用公共材质。
