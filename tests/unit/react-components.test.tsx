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
import { VeyCheckbox } from "../../packages/react/src/components/VeyCheckbox/VeyCheckbox";
import { VeyFormItem } from "../../packages/react/src/components/VeyFormItem/VeyFormItem";
import { VeyInput } from "../../packages/react/src/components/VeyInput/VeyInput";
import { VeyLoading } from "../../packages/react/src/components/VeyLoading/VeyLoading";
import { VeyMenu } from "../../packages/react/src/components/VeyMenu/VeyMenu";
import { VeyModal } from "../../packages/react/src/components/VeyModal/VeyModal";
import { VeySelect } from "../../packages/react/src/components/VeySelect/VeySelect";
import { VeySelectionBar } from "../../packages/react/src/components/VeySelectionBar/VeySelectionBar";
import { VeySwitch } from "../../packages/react/src/components/VeySwitch/VeySwitch";
import { VeyTable } from "../../packages/react/src/components/VeyTable/VeyTable";
import { VeyTabs } from "../../packages/react/src/components/VeyTabs/VeyTabs";
import { VeyToast } from "../../packages/react/src/components/VeyToast/VeyToast";
import { VeyTooltip } from "../../packages/react/src/components/VeyTooltip/VeyTooltip";

afterEach(cleanup);

describe("React 公共组件行为", () => {
  it("Select 支持键盘选择并暴露 listbox 语义", async () => {
    const onChange = vi.fn();
    render(
      <VeySelect
        value={null}
        options={[{ label: "可用", value: "enabled" }]}
        onChange={onChange}
      />,
    );
    const combobox = screen.getByRole("combobox");
    expect(combobox.id).not.toBe("");
    await userEvent.type(combobox, "{enter}");
    await userEvent.type(combobox, "{enter}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("enabled");
  });

  it("Select 将字段标识和表单值绑定到按钮与隐藏字段", () => {
    const view = render(
      <form data-testid="form">
        <VeySelect
          id="region"
          name="region"
          ariaLabel="区域"
          ariaLabelledby="region-label"
          ariaDescribedby="region-hint"
          value="cn-east"
          options={[{ label: "华东", value: "cn-east" }]}
          data-slot="region-field"
        />
      </form>,
    );
    const combobox = screen.getByRole("combobox");
    expect(combobox.tagName).toBe("BUTTON");
    expect(combobox).toHaveAttribute("id", "region");
    expect(combobox).toHaveAttribute("aria-label", "区域");
    expect(combobox).toHaveAttribute("aria-labelledby", "region-label");
    expect(combobox).toHaveAttribute("aria-describedby", "region-hint");
    expect(combobox.closest(".vl-select")).toHaveAttribute(
      "data-slot",
      "region-field",
    );
    expect(combobox.closest(".vl-select")).not.toHaveAttribute("id");
    expect(
      new FormData(screen.getByTestId("form") as HTMLFormElement).get("region"),
    ).toBe("cn-east");

    view.rerender(
      <form data-testid="form">
        <VeySelect name="region" value={null} options={[]} />
      </form>,
    );
    expect(
      new FormData(screen.getByTestId("form") as HTMLFormElement).get("region"),
    ).toBe("");
    view.rerender(
      <form data-testid="form">
        <VeySelect name="region" value={null} disabled options={[]} />
      </form>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(
      new FormData(screen.getByTestId("form") as HTMLFormElement).has("region"),
    ).toBe(false);
  });

  it("Modal 响应 Escape 并恢复触发器焦点", async () => {
    const onCancel = vi.fn();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const view = render(
      <VeyModal visible title="确认" message="继续操作" onCancel={onCancel} />,
    );
    await waitFor(() =>
      expect(screen.getByRole("alertdialog")).toContainElement(
        document.activeElement as HTMLElement,
      ),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
    view.rerender(
      <VeyModal
        visible={false}
        title="确认"
        message="继续操作"
        onCancel={onCancel}
      />,
    );
    expect(trigger).toHaveFocus();
  });

  it("Switch 与 Checkbox 暴露原生状态", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <VeySwitch value={false} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
    rerender(<VeyCheckbox checked={false} indeterminate onChange={vi.fn()} />);
    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
    expect(screen.getByRole("checkbox").closest("label")).toHaveClass(
      "is-indeterminate",
    );
  });

  it("Checkbox 将字段标识传递到原生复选框", async () => {
    const onChange = vi.fn();
    const view = render(
      <VeyCheckbox
        id="cleanup"
        name="cleanup"
        ariaLabel="清理缓存"
        ariaLabelledby="cleanup-label"
        ariaDescribedby="cleanup-hint"
        checked={false}
        onChange={onChange}
      >
        清理
      </VeyCheckbox>,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("id", "cleanup");
    expect(checkbox).toHaveAttribute("name", "cleanup");
    expect(checkbox).toHaveAttribute("aria-label", "清理缓存");
    expect(checkbox).toHaveAttribute("aria-labelledby", "cleanup-label");
    expect(checkbox).toHaveAttribute("aria-describedby", "cleanup-hint");
    expect(checkbox.closest("label")).toHaveAttribute("for", "cleanup");
    await userEvent.click(screen.getByText("清理"));
    expect(onChange).toHaveBeenCalledWith(true);

    view.rerender(<VeyCheckbox checked={false}>自动标识</VeyCheckbox>);
    const automatic = screen.getByRole("checkbox");
    expect(automatic.id).not.toBe("");
    expect(automatic.closest("label")).toHaveAttribute("for", automatic.id);
  });

  it("FormItem 关联 label、hint 与 error", () => {
    render(
      <VeyFormItem
        label="端口"
        htmlFor="port"
        hint="1-65535"
        error="无效端口"
        labelId="port-label"
        hintId="port-hint"
        errorId="port-error"
      >
        <input id="port" />
      </VeyFormItem>,
    );
    expect(screen.getByLabelText("端口")).toHaveAttribute("id", "port");
    expect(screen.getByText("端口").closest("label")).toHaveAttribute(
      "id",
      "port-label",
    );
    expect(screen.getByText("1-65535")).toHaveAttribute("id", "port-hint");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "port-error");
    expect(screen.getByRole("alert")).toHaveTextContent("无效端口");
  });

  it("Input 数字模式发出 number 或 null", () => {
    const onChange = vi.fn();
    render(
      <VeyInput<number | null> type="number" value={1} onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "42" },
    });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(onChange).toHaveBeenNthCalledWith(1, 42);
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });

  it("Input 将字段标识传递到真实输入控件", () => {
    const view = render(
      <VeyInput
        id="username"
        name="username"
        ariaLabel="用户名"
        ariaLabelledby="username-label"
        ariaDescribedby="username-hint"
        value="admin"
        data-slot="username-field"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "username");
    expect(input).toHaveAttribute("name", "username");
    expect(input).toHaveAttribute("aria-label", "用户名");
    expect(input).toHaveAttribute("aria-labelledby", "username-label");
    expect(input).toHaveAttribute("aria-describedby", "username-hint");
    expect(input.closest(".vl-input-wrapper")).toHaveAttribute(
      "data-slot",
      "username-field",
    );
    expect(input.closest(".vl-input-wrapper")).not.toHaveAttribute("id");

    view.rerender(<VeyInput type="textarea" name="description" value="" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.id).not.toBe("");
    expect(textarea).toHaveAttribute("name", "description");

    view.rerender(<VeyInput type="password" name="password" value="secret" />);
    const password = document.querySelector<HTMLInputElement>(
      'input[type="password"]',
    );
    expect(password?.id).not.toBe("");
    expect(password).toHaveAttribute("name", "password");
  });

  it("Menu 与 Tabs 仅通过 onChange 返回新值", async () => {
    const menuChange = vi.fn();
    const view = render(
      <VeyMenu
        value="overview"
        items={[
          {
            key: "general",
            label: "常规",
            children: [{ key: "security", label: "安全" }],
          },
        ]}
        onChange={menuChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "安全" }));
    expect(menuChange).toHaveBeenCalledOnce();
    expect(menuChange).toHaveBeenCalledWith("security");

    const tabsChange = vi.fn();
    view.rerender(
      <VeyTabs
        value="overview"
        tabs={[
          { name: "overview", label: "概览" },
          { name: "detail", label: "详情" },
        ]}
        onChange={tabsChange}
      />,
    );
    await userEvent.click(screen.getByRole("tab", { name: "详情" }));
    expect(tabsChange).toHaveBeenCalledOnce();
    expect(tabsChange).toHaveBeenCalledWith("detail");
  });

  it("Tooltip 禁用时不显示提示", async () => {
    const view = render(
      <VeyTooltip text="说明" delay={0} disabled>
        <button type="button">触发器</button>
      </VeyTooltip>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "触发器" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    view.rerender(
      <VeyTooltip text="说明" delay={0}>
        <button type="button">触发器</button>
      </VeyTooltip>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "触发器" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("说明");
  });

  it("Table 累计固定列偏移", () => {
    render(
      <VeyTable
        data={[{ id: "row-1", name: "节点" }]}
        rowKey="id"
        columns={[
          { prop: "id", label: "ID", width: 80, fixed: "left" },
          { prop: "name", label: "名称", width: 120, fixed: "left" },
        ]}
      />,
    );
    expect(screen.getByText("节点").closest("td")).toHaveStyle({
      left: "80px",
    });
  });

  it("Table 支持当前页全选、半选和禁用行", async () => {
    const data = [
      { id: "row-1", name: "节点一", disabled: false },
      { id: "row-2", name: "节点二", disabled: false },
      { id: "row-3", name: "节点三", disabled: true },
    ];
    const columns = [
      {
        prop: "name",
        label: "名称",
        width: 120,
        fixed: "left" as const,
      },
    ];
    const onSelectedRowKeysChange = vi.fn();
    const onSelectionChange = vi.fn();
    const view = render(
      <VeyTable
        data={data}
        columns={columns}
        rowKey="id"
        selectable
        selectedRowKeys={["other-page", "row-1"]}
        rowSelectable={(row) => !row.disabled}
        selectAllLabel="选择当前页全部通知"
        selectRowLabel={(row) => `选择${row.name}`}
        onSelectedRowKeysChange={onSelectedRowKeysChange}
        onSelectionChange={onSelectionChange}
      />,
    );
    const selectAll = screen.getByRole("checkbox", {
      name: "选择当前页全部通知",
    });
    expect(selectAll).toBePartiallyChecked();
    expect(screen.getByRole("checkbox", { name: "选择节点三" })).toBeDisabled();
    expect(screen.getByText("节点一").closest("td")).toHaveStyle({
      left: "48px",
    });

    await userEvent.click(selectAll);
    expect(onSelectedRowKeysChange).toHaveBeenLastCalledWith([
      "other-page",
      "row-1",
      "row-2",
    ]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([
      "other-page",
      "row-1",
      "row-2",
    ]);

    view.rerender(
      <VeyTable
        data={data}
        columns={columns}
        rowKey="id"
        selectable
        selectedRowKeys={["other-page", "row-1", "row-2"]}
        rowSelectable={(row) => !row.disabled}
        selectAllLabel="选择当前页全部通知"
        selectRowLabel={(row) => `选择${row.name}`}
        onSelectedRowKeysChange={onSelectedRowKeysChange}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "选择当前页全部通知" }),
    );
    expect(onSelectedRowKeysChange).toHaveBeenLastCalledWith(["other-page"]);
  });

  it("SelectionBar 显示结构化计数并支持清除", async () => {
    const onClear = vi.fn();
    render(
      <VeySelectionBar
        count={3}
        label="已选择"
        clearLabel="清除选择"
        ariaLabel="已选择 3 项"
        onClear={onClear}
      >
        <button type="button">归档</button>
      </VeySelectionBar>,
    );
    expect(screen.getByText("已选择")).toHaveClass("vl-selection-label");
    expect(screen.getByText("3")).toHaveClass("vl-selection-count");
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "已选择 3 项",
    );
    await userEvent.click(screen.getByRole("button", { name: "清除选择" }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "归档" })).toBeInTheDocument();
  });

  it("Toast 仅由关闭按钮关闭，Loading 暴露 busy 状态", async () => {
    const onClose = vi.fn();
    const view = render(
      <VeyToast
        toasts={[{ id: "1", type: "info", title: "标题", message: "内容" }]}
        onClose={onClose}
      />,
    );
    await userEvent.click(screen.getByText("内容"));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", { name: "Close notification" }),
    );
    expect(onClose).toHaveBeenCalledWith("1");
    view.rerender(<VeyLoading loading text="加载" />);
    expect(
      screen.getByText("加载").closest('[aria-busy="true"]'),
    ).not.toBeNull();
  });
});
