import { expect, test, type Page } from "@playwright/test";

async function waitForFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

for (const app of [
  { name: "vue", url: "http://127.0.0.1:4173" },
  { name: "react", url: "http://127.0.0.1:4174" },
] as const) {
  test(`${app.name} 高风险组件视觉基线`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(app.url);
    await waitForFonts(page);
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-theme", "dark"),
    );

    const select = page.locator('[data-ui="qa-select"]');
    await select.scrollIntoViewIfNeeded();
    await select.getByRole("combobox").click();
    await waitForFonts(page);
    await expect(page.getByRole("listbox")).toHaveScreenshot(
      `${app.name}-select.png`,
    );
    await page.keyboard.press("Escape");

    const action = page.locator('[data-ui="qa-action-menu"]');
    await action.scrollIntoViewIfNeeded();
    await action.getByRole("button").click();
    await waitForFonts(page);
    await expect(page.getByRole("menu")).toHaveScreenshot(
      `${app.name}-action-menu.png`,
    );
    await page.keyboard.press("Escape");

    const tooltip = page.locator('[data-ui="qa-tooltip"]');
    await tooltip.scrollIntoViewIfNeeded();
    await tooltip.getByRole("button").hover();
    await waitForFonts(page);
    await expect(page.getByRole("tooltip")).toHaveScreenshot(
      `${app.name}-tooltip.png`,
    );

    await page.getByRole("button", { name: "打开对话框 (Dialog)" }).click();
    await waitForFonts(page);
    await expect(
      page.getByRole("dialog", { name: "安全审计详情" }),
    ).toHaveScreenshot(`${app.name}-dialog.png`);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "打开右侧抽屉 (Drawer)" }).click();
    await waitForFonts(page);
    await expect(
      page.getByRole("dialog", { name: "集群高级策略配置" }),
    ).toHaveScreenshot(`${app.name}-drawer.png`);
    await page.keyboard.press("Escape");

    const formError = page
      .getByText("示例错误：请输入合法的节点地址")
      .locator("../..");
    await formError.scrollIntoViewIfNeeded();
    await expect(formError).toHaveScreenshot(`${app.name}-form-error.png`);

    const datePicker = page.locator('[data-ui="qa-date-time-range"]');
    await datePicker.scrollIntoViewIfNeeded();
    await datePicker.getByRole("button").first().click();
    await waitForFonts(page);
    await expect(datePicker).toHaveScreenshot(
      `${app.name}-date-time-range.png`,
    );
    await page.keyboard.press("Escape");

    const table = page.locator('[data-ui="qa-table"]');
    await table.scrollIntoViewIfNeeded();
    await expect(table).toHaveScreenshot(`${app.name}-table.png`);

    await page.getByRole("button", { name: "触发成功通知" }).click();
    await waitForFonts(page);
    await expect(page.getByRole("status")).toHaveScreenshot(
      `${app.name}-toast.png`,
    );
  });
}
