import { expect, test, type Page } from "@playwright/test";

const apps = [
  { name: "vue", url: "http://127.0.0.1:4173" },
  { name: "react", url: "http://127.0.0.1:4174" },
] as const;
async function openApp(page: Page, url: string) {
  await page.goto(url);
  await page.emulateMedia({ reducedMotion: "reduce" });
}

for (const app of apps)
  test.describe(app.name, () => {
    test("组件锚点目录支持定位与滚动高亮", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await openApp(page, app.url);

      const menu = page.locator('[data-ui="component-anchor-menu"]');
      await expect(menu).toBeVisible();
      const initialHeaderY = (
        await page.locator(".playground-header").boundingBox()
      )?.y;
      expect(initialHeaderY).toBeDefined();
      await menu.getByRole("link", { name: "Tooltip 文字提示" }).click();
      await expect(page).toHaveURL(/#component-tooltip$/);
      await expect(page.locator("#component-tooltip")).toBeInViewport();

      await page
        .locator("#component-select")
        .evaluate((element) => element.scrollIntoView({ block: "start" }));
      await expect(
        menu.getByRole("link", { name: "Select 选择器" }),
      ).toHaveClass(/active/);
      await expect(page).toHaveURL(/#component-select$/);
      await expect
        .poll(async () => {
          const box = await page.locator(".playground-header").boundingBox();
          return box?.y;
        })
        .toBe(initialHeaderY);
    });

    test("浮层跟随视口并支持键盘", async ({ page }) => {
      await openApp(page, app.url);
      const action = page.locator('[data-ui="qa-action-menu"]');
      await action.scrollIntoViewIfNeeded();
      await action.getByRole("button").press("Enter");
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(action.getByRole("button")).toBeFocused();
      const tooltip = page.locator('[data-ui="qa-tooltip"]');
      await tooltip.scrollIntoViewIfNeeded();
      await tooltip.getByRole("button").hover();
      const popup = page.getByRole("tooltip");
      await expect(popup).toBeVisible();
      const box = await popup.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      await page.evaluate(() => window.scrollBy(0, 32));
      await expect(popup).toBeVisible();
    });

    test("模态焦点、Escape 与焦点恢复", async ({ page }) => {
      await openApp(page, app.url);
      const trigger = page.getByRole("button", { name: "打开对话框 (Dialog)" });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await expect(
        page.getByRole("dialog", { name: "安全审计详情" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      const drawerTrigger = page.getByRole("button", {
        name: "打开右侧抽屉 (Drawer)",
      });
      await drawerTrigger.click();
      await expect(
        page.getByRole("dialog", { name: "集群高级策略配置" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawerTrigger).toBeFocused();
    });

    test("ActionMenu 显示在模态层之上", async ({ page }) => {
      await openApp(page, app.url);
      await page.getByRole("button", { name: "打开右侧抽屉 (Drawer)" }).click();
      const drawer = page.getByRole("dialog", { name: "集群高级策略配置" });
      await expect(drawer).toBeVisible();

      const action = page.locator('[data-ui="qa-action-menu"]');
      await action
        .getByRole("button")
        .evaluate((button: HTMLButtonElement) => button.click());

      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const layers = await page.evaluate(() => ({
        menu: Number(
          getComputedStyle(document.querySelector('[role="menu"]')!).zIndex,
        ),
        drawer: Number(
          getComputedStyle(document.querySelector(".vl-drawer-overlay")!)
            .zIndex,
        ),
      }));
      expect(layers.menu).toBeGreaterThan(layers.drawer);
    });

    test("Loading cover 覆盖父容器内的高层级内容", async ({ page }) => {
      await openApp(page, app.url);
      const fixture = page.locator('[data-ui="qa-loading-cover"]');
      await fixture.scrollIntoViewIfNeeded();

      const layers = await fixture.evaluate((container) => {
        const loadingHost = container.querySelector<HTMLElement>(
          ".vl-loading-host.is-cover.is-loading",
        )!;
        const stickyContent = container.querySelector<HTMLElement>(
          '[data-slot="sticky-content"]',
        )!;
        const stickyRect = stickyContent.getBoundingClientRect();
        const topElement = document.elementFromPoint(
          stickyRect.left + stickyRect.width / 2,
          stickyRect.top + stickyRect.height / 2,
        );

        return {
          loading: Number(getComputedStyle(loadingHost).zIndex),
          sticky: Number(getComputedStyle(stickyContent).zIndex),
          modal: Number(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--vdl-z-index-modal",
            ),
          ),
          maskIsTopmost: topElement?.closest(".vl-loading-mask") !== null,
        };
      });

      expect(layers.loading).toBeGreaterThan(layers.sticky);
      expect(layers.loading).toBeLessThan(layers.modal);
      expect(layers.maskIsTopmost).toBe(true);
    });

    test("导航组件支持纯键盘操作", async ({ page }) => {
      await openApp(page, app.url);
      const tabs = page.locator('[data-ui="qa-tabs"]');
      await tabs.scrollIntoViewIfNeeded();
      await tabs.getByRole("tab").first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      const menuButtons = page
        .locator('[data-ui="qa-menu"]')
        .getByRole("button");
      await menuButtons.first().focus();
      await page.keyboard.press("ArrowDown");
      await expect(menuButtons.nth(1)).toBeFocused();
      const pagination = page.locator('[data-ui="qa-pagination"]');
      await pagination.scrollIntoViewIfNeeded();
      await pagination
        .getByRole("button", { name: /Next page|下一页/ })
        .click();
      await expect(pagination.locator('[aria-current="page"]')).toContainText(
        "2",
      );
    });

    test("320px 视口不产生页面级横向溢出", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await openApp(page, app.url);
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (value) => document.documentElement.setAttribute("data-theme", value),
          theme,
        );
        const width = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          page: document.documentElement.scrollWidth,
        }));
        expect(width.page).toBeLessThanOrEqual(width.viewport);
      }
    });
  });
