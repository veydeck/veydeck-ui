# 贡献指南

## 组件变更

新增组件必须至少有两个明确复用场景。新增或修改公共组件时必须同步完成：

1. Vue 与 React 实现及公开类型。
2. `tests/component-behavior-matrix.ts` 行为契约。
3. 分类组件文档和两端 Playground 标准场景。
4. 两端对称单元测试；浮层、模态、导航等高风险行为增加 Playwright。
5. 用户可感知变更写入两个包的 `Unreleased`。

## 验证

提交前运行：

```bash
pnpm format:check
pnpm check
pnpm test:e2e
```

视觉变更必须人工确认差异后显式运行 `pnpm test:e2e:update`，不得通过放宽截图阈值绕过回归。
