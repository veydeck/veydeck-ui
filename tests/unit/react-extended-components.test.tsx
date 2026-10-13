import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VeyActionMenu,
  VeyAlert,
  VeyBreadcrumb,
  VeyBreadcrumbItem,
  VeyButton,
  VeyCard,
  VeyDateTimeRangePicker,
  VeyDescriptions,
  VeyDialog,
  VeyDrawer,
  VeyEmpty,
  VeyIcon,
  VeyMenu,
  VeyPagination,
  VeyTabs,
  VeyTag,
  VeyTooltip,
} from "../../packages/react/src";

afterEach(cleanup);

describe("React 扩展组件行为", () => {
  it("ActionMenu 支持键盘打开和执行", async () => {
    const handler = vi.fn();
    render(<VeyActionMenu actions={[{ label: "执行", handler }]} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    await userEvent.click(await screen.findByRole("menuitem"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("ActionMenu 同一时刻只展开一个并在定位后显示", () => {
    render(
      <>
        <VeyActionMenu
          label="操作一"
          actions={[{ label: "执行一", handler: vi.fn() }]}
        />
        <VeyActionMenu
          label="操作二"
          actions={[{ label: "执行二", handler: vi.fn() }]}
        />
      </>,
    );

    const first = screen.getByRole("button", { name: "操作一" });
    const second = screen.getByRole("button", { name: "操作二" });
    fireEvent.click(first);
    expect(screen.getByRole("menu")).toHaveClass("is-positioned");
    fireEvent.click(second);

    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("Tooltip 渲染提示语义", async () => {
    render(
      <VeyTooltip text="帮助" delay={0}>
        <button>目标</button>
      </VeyTooltip>,
    );
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "目标" }).parentElement!,
    );
    await waitFor(() =>
      expect(screen.getByRole("tooltip")).toHaveTextContent("帮助"),
    );
  });

  it("Dialog 与 Drawer 响应 Escape", async () => {
    const closeDialog = vi.fn();
    const view = render(
      <VeyDialog visible title="对话框" onClose={closeDialog}>
        内容
      </VeyDialog>,
    );
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeDialog).toHaveBeenCalledOnce();
    view.unmount();
    const closeDrawer = vi.fn();
    render(
      <VeyDrawer visible title="抽屉" onClose={closeDrawer}>
        内容
      </VeyDrawer>,
    );
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeDrawer).toHaveBeenCalledOnce();
  });

  it("嵌套模态关闭一层后继续保持滚动锁", async () => {
    const view = render(
      <>
        <VeyDialog visible title="外层">
          内容
        </VeyDialog>
        <VeyDrawer visible title="内层">
          内容
        </VeyDrawer>
      </>,
    );
    await waitFor(() => expect(document.body.style.overflow).toBe("hidden"));
    view.rerender(
      <VeyDrawer visible title="内层">
        内容
      </VeyDrawer>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    view.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("Tabs、Menu 与 Pagination 支持键盘或原生按钮交互", async () => {
    const onTab = vi.fn();
    const view = render(
      <VeyTabs
        value="a"
        onChange={onTab}
        tabs={[
          { name: "a", label: "A" },
          { name: "b", label: "B" },
        ]}
      />,
    );
    fireEvent.keyDown(screen.getAllByRole("tab")[0], { key: "ArrowRight" });
    expect(onTab).toHaveBeenCalledWith("b");
    view.unmount();
    render(
      <VeyMenu
        value="a"
        onChange={vi.fn()}
        items={[
          {
            key: "group",
            label: "分组",
            children: [
              { key: "a", label: "A" },
              { key: "b", label: "B" },
            ],
          },
        ]}
      />,
    );
    const menuButtons = screen.getAllByRole("button");
    menuButtons[0].focus();
    fireEvent.keyDown(menuButtons[0], { key: "ArrowDown" });
    expect(menuButtons[1]).toHaveFocus();
    cleanup();
    const onPage = vi.fn();
    render(
      <VeyPagination currentPage={1} totalPages={3} onPageChange={onPage} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPage).toHaveBeenCalledWith(2);
  });

  it("DateTimeRangePicker 提供可操作触发器", () => {
    render(
      <VeyDateTimeRangePicker
        value={{ startAt: null, endAt: null }}
        onChange={vi.fn()}
        placeholder="选择时间"
        startLabel="开始"
        endLabel="结束"
        shortcutsLabel="快捷"
        calendarLabel="日历"
        timeLabel="时间"
        clearLabel="清除"
        confirmLabel="确认"
        cancelLabel="取消"
        locale="zh"
        weekDays={["一", "二", "三", "四", "五", "六", "日"]}
        shortcuts={[]}
      />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("展示组件渲染公开状态", async () => {
    const view = render(<VeyButton loading>保存</VeyButton>);
    expect(screen.getByRole("button")).toBeDisabled();
    view.rerender(<VeyTag type="success">正常</VeyTag>);
    expect(screen.getByText("正常")).toHaveClass("vl-tag");
    view.rerender(<VeyCard>内容</VeyCard>);
    expect(screen.getByText("内容")).toBeInTheDocument();
    const onClose = vi.fn();
    view.rerender(<VeyAlert title="警告" closable onClose={onClose} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledOnce();
    view.rerender(<VeyEmpty description="暂无" />);
    expect(screen.getByText("暂无")).toBeInTheDocument();
    view.rerender(
      <VeyDescriptions items={[{ label: "名称", value: "节点" }]} />,
    );
    expect(screen.getByText("节点")).toBeInTheDocument();
    view.rerender(<VeyIcon name="info" decorative={false} label="信息" />);
    expect(screen.getByLabelText("信息")).toBeInTheDocument();
    view.rerender(
      <VeyBreadcrumb>
        <VeyBreadcrumbItem>首页</VeyBreadcrumbItem>
      </VeyBreadcrumb>,
    );
    expect(screen.getByText("首页")).toBeInTheDocument();
  });
});
