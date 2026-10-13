import { describe, expect, it } from "vitest";
import * as reactComponents from "../../packages/react/src";
import * as vueComponents from "../../packages/vue/src";
import { componentBehaviorMatrix } from "../component-behavior-matrix";

describe("跨框架公共组件契约", () => {
  it("行为矩阵覆盖全部 27 个组件", () => {
    expect(Object.keys(componentBehaviorMatrix)).toHaveLength(27);
  });

  it.each(Object.keys(componentBehaviorMatrix))(
    "%s 在 Vue 与 React 中均公开导出",
    (name) => {
      expect(vueComponents).toHaveProperty(name);
      expect(reactComponents).toHaveProperty(name);
    },
  );
});
