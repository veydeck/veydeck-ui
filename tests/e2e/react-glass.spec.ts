import { expect, test, type Page } from "@playwright/test";

async function openLab(page: Page) {
  await page.goto("http://127.0.0.1:4174/?glass");
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-ui="glass-button"]')).toHaveAttribute(
    "data-glass-mode",
    /refraction|blur/,
  );
}

test("React glass: Provider updates controls without remounting", async ({
  page,
}) => {
  await openLab(page);
  const button = page.locator('[data-ui="glass-button"]');
  const handle = await button.evaluateHandle((element) => element);
  await page.getByLabel("独立参数覆盖").check();
  await page.getByRole("slider", { name: "底色不透明度" }).fill("0.7");
  await expect(button).toHaveCSS("--vl-glass-opacity", "70%");
  expect(await handle.evaluate((element) => element.isConnected)).toBe(true);

  await page.getByLabel("启用玻璃", { exact: true }).uncheck();
  await expect(button).toHaveAttribute("data-glass-mode", "solid");
  await page.getByLabel("启用玻璃", { exact: true }).check();
  await expect(button).toHaveAttribute("data-glass-mode", /refraction|blur/);
});

test("React glass: Portal inherits theme and scoped tokens", async ({
  page,
}) => {
  await openLab(page);
  await page.getByLabel("深色主题").check();
  await page
    .locator('[data-ui="glass-provider"]')
    .last()
    .evaluate((element) => {
      (element as HTMLElement).style.setProperty("--vdl-bg-base", "#223344");
    });
  await page.getByRole("combobox", { name: "选择节点" }).click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toHaveAttribute("data-theme", "dark");
  await expect(listbox).toHaveCSS("--vdl-bg-base", "#223344");
  await expect(listbox).toHaveAttribute("data-glass-mode", /refraction|blur/);
});

test("React glass: local override, active tab and resource cleanup", async ({
  page,
}) => {
  await openLab(page);
  await expect(page.getByRole("button", { name: "实色覆盖" })).toHaveAttribute(
    "data-glass-mode",
    "solid",
  );
  await page.getByRole("tab", { name: "设置", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "设置", exact: true }),
  ).toHaveClass(/vl-glass/);
  await expect(
    page.getByRole("tab", { name: "概览", exact: true }),
  ).not.toHaveClass(/vl-glass/);
  await page.getByLabel("挂载演示组件").uncheck();
  await expect(page.locator("[data-veydeck-glass-filter]")).toHaveCount(0);
});

test("React glass: reduced transparency uses the solid accessible fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) =>
        query === "(prefers-reduced-transparency: reduce)"
          ? {
              matches: true,
              media: query,
              onchange: null,
              addEventListener() {},
              removeEventListener() {},
              addListener() {},
              removeListener() {},
              dispatchEvent: () => true,
            }
          : nativeMatchMedia(query),
    });
  });
  await page.goto("http://127.0.0.1:4174/?glass");
  const button = page.locator('[data-ui="glass-button"]');
  await expect(button).toHaveAttribute("data-glass-mode", "solid");
  await expect(page.locator("[data-veydeck-glass-filter]")).toHaveCount(0);
  const toggle = page.getByLabel("启用玻璃", { exact: true });
  await toggle.focus();
  await expect(toggle).toBeFocused();
});
