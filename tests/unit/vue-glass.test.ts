import { describe, expect, it, afterEach, vi } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import {
  VeyButton,
  VeyCard,
  VeyGlassProvider,
  VeyGlassSurface,
  VeyInput,
  VeyTable,
  VeyTabs,
} from "../../packages/vue/src";
import { resolveGlass } from "../../packages/vue/src/glass";

enableAutoUnmount(afterEach);
afterEach(() => vi.unstubAllGlobals());
const frame = () => new Promise((resolve) => setTimeout(resolve, 35));

describe("Vue glass material contract", () => {
  it("normalizes public values, keeps explicit overrides and handles invalid numbers", () => {
    expect(resolveGlass(false).enabled).toBe(false);
    expect(resolveGlass(undefined).enabled).toBe(true);
    expect(resolveGlass({ intensity: 0 })).toMatchObject({
      refraction: 0,
      blur: 0,
      opacity: 1,
      highlight: 0,
    });
    expect(resolveGlass({ intensity: 0, refraction: 0.7 })).toMatchObject({
      refraction: 0.7,
      opacity: 1,
    });
    expect(
      resolveGlass({
        refraction: 5,
        blur: -1,
        opacity: NaN,
        highlight: Infinity,
      }),
    ).toMatchObject({ refraction: 1, blur: 0, highlight: 0.6 });
    expect(resolveGlass({ opacity: NaN }).opacity).toBeCloseTo(0.3);
  });

  it("does not cast an omitted glass prop to false", () => {
    const wrapper = mount(VeyButton);
    expect(wrapper.props("glass")).toBeUndefined();
    expect(wrapper.classes()).toContain("vl-glass");
  });

  it("renders a public layout-neutral surface with inherited and local material", async () => {
    const value = ref<boolean>(true);
    const Host = defineComponent({
      components: { VeyGlassProvider, VeyGlassSurface },
      setup: () => ({ value }),
      template:
        '<VeyGlassProvider :glass="value"><VeyGlassSurface as="section" profile="control" aria-label="Shell">Content</VeyGlassSurface></VeyGlassProvider>',
    });
    const wrapper = mount(Host);
    const surface = wrapper.get("section");
    expect(surface.attributes("aria-label")).toBe("Shell");
    expect(surface.attributes("data-glass-profile")).toBe("control");
    expect(surface.classes()).toContain("vl-glass");

    value.value = false;
    await frame();
    expect(surface.attributes("data-glass-mode")).toBe("solid");
    expect(document.querySelector("[data-veydeck-glass-filter]")).toBeNull();
  });

  it("keeps the material class through Vue state updates", async () => {
    const wrapper = mount(VeyButton);
    await wrapper.setProps({ loading: true, glass: { opacity: 0.4 } });
    expect(wrapper.classes()).toContain("vl-glass");
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("only mounts material on the active tab", async () => {
    const wrapper = mount(VeyTabs, {
      props: {
        modelValue: "a",
        tabs: [
          { name: "a", label: "A" },
          { name: "b", label: "B" },
        ],
      },
    });
    expect(wrapper.findAll(".vl-glass")).toHaveLength(1);
    await wrapper.setProps({ modelValue: "b" });
    expect(wrapper.findAll(".vl-glass")).toHaveLength(1);
    expect(wrapper.get(".vl-glass").text()).toBe("B");
  });

  it("passes the table material through to selection checkboxes", async () => {
    vi.stubGlobal("CSS", { supports: () => true });
    const wrapper = mount(VeyTable, {
      props: {
        glass: { refraction: 0, blur: 0.5, opacity: 0.42 },
        data: [{ id: "node-1", name: "Node 1" }],
        columns: [{ prop: "name", label: "Name" }],
        rowKey: "id",
        selectable: true,
        selectedRowKeys: ["node-1"],
      },
    });
    await frame();

    const controls = wrapper.findAll(".vl-checkbox-inner");
    expect(controls).toHaveLength(2);
    controls.forEach((control) => {
      expect(control.classes()).toContain("vl-glass");
      expect(control.attributes("data-glass-mode")).toBe("blur");
      expect(control.attributes("style")).toContain("--vl-glass-opacity: 42%");
    });

    await wrapper.setProps({ glass: false });
    await frame();
    controls.forEach((control) => {
      expect(control.attributes("data-glass-mode")).toBe("solid");
    });
  });

  it("updates material without replacing the input or losing its draft", async () => {
    const wrapper = mount(VeyInput, {
      attachTo: document.body,
      props: { modelValue: "draft" },
    });
    const input = wrapper.get("input").element;
    input.focus();
    await wrapper.setProps({ glass: false });
    await frame();
    expect(wrapper.get("input").element).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("draft");
  });

  it("inherits Provider updates without leaking a component override into its slot", async () => {
    vi.stubGlobal("CSS", { supports: () => true });
    const value = ref<boolean | { intensity: number }>(false);
    const Host = defineComponent({
      components: { VeyGlassProvider, VeyButton, VeyCard },
      setup: () => ({ value }),
      template:
        '<VeyGlassProvider :glass="value"><VeyCard :glass="true"><VeyButton>Child</VeyButton></VeyCard></VeyGlassProvider>',
    });
    const wrapper = mount(Host);
    await frame();
    const card = wrapper.getComponent(VeyCard);
    const button = wrapper.getComponent(VeyButton);
    expect(card.attributes("data-glass-mode")).toBe("blur");
    expect(button.attributes("data-glass-mode")).toBe("solid");
    value.value = { intensity: 0.5 };
    await frame();
    expect(button.attributes("data-glass-mode")).toBe("blur");
    expect(button.element.style.getPropertyValue("--vl-glass-opacity")).toBe(
      "65%",
    );
    expect(card.element.style.getPropertyValue("--vl-glass-opacity")).toBe(
      "30%",
    );
  });
});
