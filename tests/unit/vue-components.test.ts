import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import VeyCheckbox from "../../packages/vue/src/components/VeyCheckbox.vue";
import VeyFormItem from "../../packages/vue/src/components/VeyFormItem.vue";
import VeyInput from "../../packages/vue/src/components/VeyInput.vue";
import VeyLoading from "../../packages/vue/src/components/VeyLoading.vue";
import VeyMenu from "../../packages/vue/src/components/VeyMenu.vue";
import VeyModal from "../../packages/vue/src/components/VeyModal.vue";
import VeySelect from "../../packages/vue/src/components/VeySelect.vue";
import VeySelectionBar from "../../packages/vue/src/components/VeySelectionBar.vue";
import VeySwitch from "../../packages/vue/src/components/VeySwitch.vue";
import VeyTable from "../../packages/vue/src/components/VeyTable.vue";
import VeyTabs from "../../packages/vue/src/components/VeyTabs.vue";
import VeyToast from "../../packages/vue/src/components/VeyToast.vue";
import VeyTooltip from "../../packages/vue/src/components/VeyTooltip.vue";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Vue 公共组件行为", () => {
  it("Select 支持键盘选择并暴露 listbox 语义", async () => {
    const wrapper = mount(VeySelect, {
      attachTo: document.body,
      props: {
        modelValue: null,
        options: [
          { label: "禁用", value: "disabled", disabled: true },
          { label: "可用", value: "enabled" },
        ],
      },
    });
    const combobox = wrapper.get('[role="combobox"]');
    expect(combobox.attributes("id")).toBeTruthy();
    await combobox.trigger("keydown", { key: "Enter" });
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    await combobox.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["enabled"]);
  });

  it("Select 将字段标识和表单值绑定到按钮与隐藏字段", async () => {
    const form = document.createElement("form");
    document.body.append(form);
    const wrapper = mount(VeySelect, {
      attachTo: form,
      props: {
        id: "region",
        name: "region",
        ariaLabel: "区域",
        ariaLabelledby: "region-label",
        ariaDescribedby: "region-hint",
        modelValue: "cn-east",
        options: [{ label: "华东", value: "cn-east" }],
      },
      attrs: { "data-slot": "region-field" },
    });
    const combobox = wrapper.get('[role="combobox"]');
    expect(combobox.element.tagName).toBe("BUTTON");
    expect(combobox.attributes()).toMatchObject({
      id: "region",
      "aria-label": "区域",
      "aria-labelledby": "region-label",
      "aria-describedby": "region-hint",
    });
    expect(wrapper.attributes("data-slot")).toBe("region-field");
    expect(wrapper.attributes("id")).toBeUndefined();
    expect(new FormData(form).get("region")).toBe("cn-east");

    await wrapper.setProps({ modelValue: null });
    expect(new FormData(form).get("region")).toBe("");
    await wrapper.setProps({ disabled: true });
    expect(combobox.attributes("disabled")).toBeDefined();
    expect(new FormData(form).has("region")).toBe(false);
  });

  it("Modal 限制焦点、响应 Escape 并恢复触发器焦点", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const wrapper = mount(VeyModal, {
      attachTo: document.body,
      props: { visible: true, title: "确认", message: "继续操作" },
    });
    await new Promise((resolve) => setTimeout(resolve));
    expect(
      document.activeElement?.closest('[role="alertdialog"]'),
    ).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("cancel")).toHaveLength(1);
    await wrapper.setProps({ visible: false });
    expect(document.activeElement).toBe(trigger);
  });

  it("Switch 与 Checkbox 暴露原生状态", async () => {
    const switchWrapper = mount(VeySwitch, { props: { modelValue: false } });
    await switchWrapper.get('button[role="switch"]').trigger("click");
    expect(switchWrapper.emitted("change")?.[0]).toEqual([true]);
    const checkbox = mount(VeyCheckbox, {
      props: { modelValue: false, indeterminate: true },
    });
    await checkbox.vm.$nextTick();
    expect(checkbox.get("input").element.indeterminate).toBe(true);
    expect(checkbox.get("input").attributes("aria-checked")).toBe("mixed");
    expect(checkbox.classes()).toContain("is-indeterminate");
  });

  it("Checkbox 将字段标识传递到原生复选框", async () => {
    const wrapper = mount(VeyCheckbox, {
      attachTo: document.body,
      props: {
        id: "cleanup",
        name: "cleanup",
        ariaLabel: "清理缓存",
        ariaLabelledby: "cleanup-label",
        ariaDescribedby: "cleanup-hint",
        modelValue: false,
      },
      slots: { default: "清理" },
    });
    const input = wrapper.get("input");
    expect(wrapper.get("label").attributes("for")).toBe("cleanup");
    expect(input.attributes()).toMatchObject({
      id: "cleanup",
      name: "cleanup",
      "aria-label": "清理缓存",
      "aria-labelledby": "cleanup-label",
      "aria-describedby": "cleanup-hint",
    });
    wrapper.get("label").element.click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("change")?.at(-1)).toEqual([true]);

    const automatic = mount(VeyCheckbox, { props: { modelValue: false } });
    expect(automatic.get("input").attributes("id")).toBeTruthy();
    expect(automatic.get("label").attributes("for")).toBe(
      automatic.get("input").attributes("id"),
    );
  });

  it("FormItem 关联 label、hint 与 error", () => {
    const wrapper = mount(VeyFormItem, {
      props: {
        label: "端口",
        for: "port",
        hint: "1-65535",
        error: "无效端口",
        labelId: "port-label",
        hintId: "port-hint",
        errorId: "port-error",
      },
      slots: { default: '<input id="port" />' },
    });
    expect(wrapper.get("label").attributes("for")).toBe("port");
    expect(wrapper.get("label").attributes("id")).toBe("port-label");
    expect(wrapper.get(".vl-form-item-hint").attributes("id")).toBe(
      "port-hint",
    );
    expect(wrapper.get('[role="alert"]').attributes("id")).toBe("port-error");
    expect(wrapper.get('[role="alert"]').text()).toBe("无效端口");
  });

  it("Input 数字模式发出 number 或 null", async () => {
    const wrapper = mount(VeyInput, {
      props: { modelValue: 1, type: "number" },
    });
    await wrapper.get("input").setValue("42");
    await wrapper.get("input").setValue("");
    expect(wrapper.emitted("update:modelValue")).toEqual([[42], [null]]);
  });

  it("Input 将字段标识传递到真实输入控件", () => {
    const wrapper = mount(VeyInput, {
      props: {
        id: "username",
        name: "username",
        ariaLabel: "用户名",
        ariaLabelledby: "username-label",
        ariaDescribedby: "username-hint",
        modelValue: "admin",
      },
      attrs: { "data-slot": "username-field" },
    });
    expect(wrapper.get("input").attributes()).toMatchObject({
      id: "username",
      name: "username",
      "aria-label": "用户名",
      "aria-labelledby": "username-label",
      "aria-describedby": "username-hint",
    });
    expect(wrapper.attributes("data-slot")).toBe("username-field");
    expect(wrapper.attributes("id")).toBeUndefined();

    const textarea = mount(VeyInput, {
      props: { modelValue: "", type: "textarea", name: "description" },
    });
    expect(textarea.get("textarea").attributes("id")).toBeTruthy();
    expect(textarea.get("textarea").attributes("name")).toBe("description");

    const password = mount(VeyInput, {
      props: { modelValue: "secret", type: "password", name: "password" },
    });
    expect(
      password.get('input[type="password"]').attributes("id"),
    ).toBeTruthy();
    expect(password.get('input[type="password"]').attributes("name")).toBe(
      "password",
    );
  });

  it("Menu 与 Tabs 使用统一的 change 事件", async () => {
    const menu = mount(VeyMenu, {
      props: {
        modelValue: "overview",
        items: [
          {
            key: "general",
            label: "常规",
            children: [{ key: "security", label: "安全" }],
          },
        ],
      },
    });
    await menu.get("button").trigger("click");
    expect(menu.emitted("update:modelValue")?.at(-1)).toEqual(["security"]);
    expect(menu.emitted("change")?.at(-1)).toEqual(["security"]);
    expect(menu.emitted("select")).toBeUndefined();

    const tabs = mount(VeyTabs, {
      props: {
        modelValue: "overview",
        tabs: [
          { name: "overview", label: "概览" },
          { name: "detail", label: "详情" },
        ],
      },
    });
    await tabs.findAll("button")[1].trigger("click");
    expect(tabs.emitted("update:modelValue")?.at(-1)).toEqual(["detail"]);
    expect(tabs.emitted("change")?.at(-1)).toEqual(["detail"]);
    expect(tabs.emitted("tab-change")).toBeUndefined();
  });

  it("Tooltip 禁用时不显示提示", async () => {
    const wrapper = mount(VeyTooltip, {
      attachTo: document.body,
      props: { text: "说明", delay: 0, disabled: true },
      slots: { default: "触发器" },
    });
    await wrapper.trigger("mouseenter");
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    await wrapper.setProps({ disabled: false });
    await wrapper.trigger("mouseenter");
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain(
      "说明",
    );
  });

  it("Table 使用稳定行键并累计固定列偏移", () => {
    const wrapper = mount(VeyTable, {
      props: {
        data: [{ id: "row-1", name: "节点" }],
        rowKey: "id",
        columns: [
          { prop: "id", label: "ID", width: 80, fixed: "left" },
          { prop: "name", label: "名称", width: 120, fixed: "left" },
        ],
      },
    });
    const cells = wrapper.findAll("tbody td");
    expect(cells[1].attributes("style")).toContain("left: 80px");
  });

  it("Table 支持当前页全选、半选和禁用行", async () => {
    const wrapper = mount(VeyTable, {
      props: {
        data: [
          { id: "row-1", name: "节点一", disabled: false },
          { id: "row-2", name: "节点二", disabled: false },
          { id: "row-3", name: "节点三", disabled: true },
        ],
        rowKey: "id",
        columns: [{ prop: "name", label: "名称", fixed: "left", width: 120 }],
        selectable: true,
        selectedRowKeys: ["other-page", "row-1"],
        rowSelectable: (row: { disabled: boolean }) => !row.disabled,
        selectAllLabel: "选择当前页全部通知",
        selectRowLabel: (row: { name: string }) => `选择${row.name}`,
      },
    });
    await wrapper.vm.$nextTick();
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(4);
    expect(checkboxes[0].element.indeterminate).toBe(true);
    expect(checkboxes[0].attributes("aria-label")).toBe("选择当前页全部通知");
    expect(checkboxes[3].attributes("disabled")).toBeDefined();
    expect(wrapper.findAll("tbody td")[1].attributes("style")).toContain(
      "left: 48px",
    );

    await checkboxes[0].setValue(true);
    expect(wrapper.emitted("update:selectedRowKeys")?.at(-1)).toEqual([
      ["other-page", "row-1", "row-2"],
    ]);
    expect(wrapper.emitted("selectionChange")?.at(-1)).toEqual([
      ["other-page", "row-1", "row-2"],
    ]);

    await wrapper.setProps({
      selectedRowKeys: ["other-page", "row-1", "row-2"],
    });
    await wrapper.find('[data-ui="table-select-all"] input').setValue(false);
    expect(wrapper.emitted("update:selectedRowKeys")?.at(-1)).toEqual([
      ["other-page"],
    ]);
  });

  it("SelectionBar 显示结构化计数并支持清除", async () => {
    const wrapper = mount(VeySelectionBar, {
      props: {
        count: 3,
        label: "已选择",
        clearLabel: "清除选择",
        ariaLabel: "已选择 3 项",
      },
      slots: { default: "<button>归档</button>" },
    });
    expect(wrapper.get(".vl-selection-label").text()).toBe("已选择");
    expect(wrapper.get(".vl-selection-count").text()).toBe("3");
    expect(wrapper.get('[role="status"]').attributes("aria-label")).toBe(
      "已选择 3 项",
    );
    await wrapper.get('[data-ui="clear-selection"]').trigger("click");
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });

  it("Toast 仅由关闭按钮关闭，Loading 暴露 busy 状态", async () => {
    const toast = mount(VeyToast, {
      attachTo: document.body,
      props: {
        toasts: [{ id: "1", type: "info", title: "标题", message: "内容" }],
      },
    });
    const item = document.querySelector<HTMLElement>(".vl-toast-item")!;
    item.click();
    expect(toast.emitted("close")).toBeUndefined();
    document.querySelector<HTMLButtonElement>(".vl-toast-close")!.click();
    expect(toast.emitted("close")?.[0]).toEqual(["1"]);
    const loading = mount(VeyLoading, {
      props: { loading: true, text: "加载" },
    });
    expect(loading.get(".vl-loading-host").attributes("aria-busy")).toBe(
      "true",
    );
    expect(loading.get('[role="status"]').text()).toContain("加载");
  });
});
