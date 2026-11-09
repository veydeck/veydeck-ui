import { enableAutoUnmount, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VeyTooltip from "../../packages/vue/src/components/VeyTooltip.vue";

enableAutoUnmount(afterEach);

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains("vl-tooltip-content")
        ? new DOMRect(0, 0, 100, 40)
        : new DOMRect(100, 100, 200, 100);
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("Vue Tooltip 鼠标定位", () => {
  it.each([
    ["top", "192px", "250px"],
    ["bottom", "248px", "250px"],
    ["left", "220px", "192px"],
    ["right", "220px", "308px"],
  ] as const)(
    "followCursor 按 %s 方向跟随最新鼠标位置",
    async (position, top, left) => {
      const wrapper = mount(VeyTooltip, {
        attachTo: document.body,
        props: { text: "帮助", followCursor: true, position, delay: 100 },
      });
      await wrapper.trigger("mouseenter", { clientX: 200, clientY: 160 });
      await wrapper.trigger("mousemove", { clientX: 250, clientY: 200 });
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      await vi.advanceTimersByTimeAsync(100);
      await nextTick();
      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      expect(tooltip.style.left).toBe(
        position === "left"
          ? "142px"
          : position === "right"
            ? "258px"
            : "200px",
      );
      await wrapper.trigger("mousemove", { clientX: 300, clientY: 240 });
      expect(tooltip.style.top).toBe(top);
      expect(tooltip.style.left).toBe(left);
      await wrapper.trigger("mouseleave");
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
    },
  );

  it("默认锚定触发器，支持动态切换并在视口边缘翻转和限位", async () => {
    const wrapper = mount(VeyTooltip, {
      attachTo: document.body,
      props: { text: "帮助", delay: 0 },
    });
    await wrapper.trigger("mouseenter", { clientX: 200, clientY: 160 });
    await vi.advanceTimersByTimeAsync(0);
    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tooltip.style.top).toBe("52px");
    expect(tooltip.style.left).toBe("150px");
    await wrapper.trigger("mousemove", { clientX: 10, clientY: 10 });
    expect(tooltip.style.left).toBe("150px");
    await wrapper.setProps({ followCursor: true });
    await nextTick();
    expect(tooltip.dataset.position).toBe("bottom");
    expect(tooltip.style.top).toBe("18px");
    expect(tooltip.style.left).toBe("5px");
    await wrapper.setProps({ followCursor: false });
    await nextTick();
    expect(tooltip.style.left).toBe("150px");
  });

  it("禁用和提前移出会取消等待中的跟随提示", async () => {
    const wrapper = mount(VeyTooltip, {
      props: { text: "帮助", followCursor: true, delay: 100 },
    });
    await wrapper.trigger("mouseenter");
    await wrapper.trigger("mouseleave");
    await vi.advanceTimersByTimeAsync(100);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await wrapper.trigger("mouseenter");
    await wrapper.setProps({ disabled: true });
    await vi.advanceTimersByTimeAsync(100);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
