import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VeyTooltip } from "../../packages/react/src/components/VeyTooltip/VeyTooltip";

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
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("React Tooltip 鼠标定位", () => {
  it.each([
    ["top", "192px", "250px"],
    ["bottom", "248px", "250px"],
    ["left", "220px", "192px"],
    ["right", "220px", "308px"],
  ] as const)(
    "followCursor 按 %s 方向跟随最新鼠标位置",
    async (position, top, left) => {
      const onMouseMove = vi.fn();
      const onMouseEnter = vi.fn();
      const onMouseLeave = vi.fn();
      const { container } = render(
        <VeyTooltip
          text="帮助"
          followCursor
          position={position}
          delay={100}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          目标
        </VeyTooltip>,
      );
      const trigger = container.firstElementChild!;
      fireEvent.mouseEnter(trigger, { clientX: 200, clientY: 160 });
      fireEvent.mouseMove(trigger, { clientX: 250, clientY: 200 });
      expect(screen.queryByRole("tooltip")).toBeNull();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.style.left).toBe(
        position === "left"
          ? "142px"
          : position === "right"
            ? "258px"
            : "200px",
      );
      fireEvent.mouseMove(trigger, { clientX: 300, clientY: 240 });
      expect(tooltip.style.top).toBe(top);
      expect(tooltip.style.left).toBe(left);
      fireEvent.mouseLeave(trigger);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
      expect(screen.queryByRole("tooltip")).toBeNull();
      expect(onMouseMove).toHaveBeenCalledTimes(2);
      expect(onMouseEnter).toHaveBeenCalledOnce();
      expect(onMouseLeave).toHaveBeenCalledOnce();
    },
  );

  it("默认锚定触发器，支持动态切换并在视口边缘翻转和限位", async () => {
    const { container, rerender } = render(
      <VeyTooltip text="帮助" delay={0}>
        目标
      </VeyTooltip>,
    );
    const trigger = container.firstElementChild!;
    fireEvent.mouseEnter(trigger, { clientX: 200, clientY: 160 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.top).toBe("52px");
    expect(tooltip.style.left).toBe("150px");
    fireEvent.mouseMove(trigger, { clientX: 10, clientY: 10 });
    expect(tooltip.style.left).toBe("150px");
    rerender(
      <VeyTooltip text="帮助" delay={0} followCursor>
        目标
      </VeyTooltip>,
    );
    expect(tooltip.dataset.position).toBe("bottom");
    expect(tooltip.style.top).toBe("18px");
    expect(tooltip.style.left).toBe("5px");
    rerender(
      <VeyTooltip text="帮助" delay={0}>
        目标
      </VeyTooltip>,
    );
    expect(tooltip.style.left).toBe("150px");
  });

  it("提前移出会取消等待中的跟随提示", async () => {
    const { container } = render(
      <VeyTooltip text="帮助" followCursor delay={100}>
        目标
      </VeyTooltip>,
    );
    const trigger = container.firstElementChild!;
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
