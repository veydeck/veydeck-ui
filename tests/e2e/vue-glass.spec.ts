import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import os from "node:os";

async function openLab(page: Page) {
  await page.goto("http://127.0.0.1:4173/?glass");
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-ui="glass-button"]')).toHaveAttribute(
    "data-glass-mode",
    /refraction|blur/,
  );
}
async function control(page: Page, name: string, value: number) {
  await page.getByRole("slider", { name, exact: true }).fill(String(value));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

test("Vue glass: shared tokens drive CSS and SVG, including scoped Teleport overrides", async ({
  page,
  browserName,
}) => {
  await openLab(page);
  const glassSurface = page.locator('[data-ui="glass-surface"]');
  await expect(glassSurface).not.toHaveCSS("background-image", "none");
  await page.evaluate(() => {
    const root = document.documentElement;
    root.style.setProperty("--vdl-glass-control-opacity", "0.4");
    root.style.setProperty("--vdl-glass-control-refraction", "0.25");
    root.style.setProperty("--vdl-glass-control-blur", "0.1");
    root.style.setProperty("--vdl-glass-refraction-max", "40px");
    root.style.setProperty("--vdl-glass-blur-max", "10px");
  });
  const button = page.locator('[data-ui="glass-button"]');
  await expect(button).toHaveCSS("--vl-glass-opacity", "40%");
  const scale = () =>
    button.evaluate((element) => {
      const id =
        getComputedStyle(element).backdropFilter.match(/#([^"\)]+)/)?.[1];
      return id
        ? document
            .getElementById(id)
            ?.querySelector("feDisplacementMap")
            ?.getAttribute("scale")
        : undefined;
    });
  if (browserName === "chromium") await expect.poll(scale).toBe("10");
  else await expect(button).toHaveCSS("backdrop-filter", /blur\(1px\)/);

  // A local stylesheet override also updates the already mounted SVG renderer.
  await page.addStyleTag({
    content:
      '[data-ui="glass-provider"] { --vdl-glass-input-opacity: 0.3; --vdl-glass-refraction-max: 20px; }',
  });
  if (browserName === "chromium") await expect.poll(scale).toBe("5");
  await page.getByRole("combobox", { name: "选择节点" }).click();
  await expect(page.getByRole("listbox")).toHaveCSS(
    "--vl-glass-opacity",
    "30%",
  );
  await expect(page.getByRole("listbox")).toHaveCSS(
    "--vdl-glass-refraction-max",
    "20px",
  );
  await page.keyboard.press("Escape");
  await page.getByLabel("独立参数覆盖").check();
  await control(page, "底色不透明度", 0.7);
  await expect(button).toHaveCSS("--vl-glass-opacity", "70%");
  if (browserName === "chromium") await expect.poll(scale).toBe("10");
});

test("Vue glass: shared tokens work without a Provider and restore invalid values", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4173/");
  const button = page.locator(".vl-button--secondary").first();
  await expect(button).toHaveAttribute("data-glass-mode", /refraction|blur/);
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--vdl-glass-control-opacity",
      "0.23",
    ),
  );
  await expect(button).toHaveCSS("--vl-glass-opacity", "23%");
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--vdl-glass-control-opacity",
      "invalid",
    ),
  );
  await expect(button).toHaveCSS("--vl-glass-opacity", "30%");
});

test("Vue glass: root material preference refreshes without another interaction", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4173/");
  const button = page.locator(".vl-button--secondary").first();
  await expect(button).toHaveAttribute("data-glass-mode", /refraction|blur/);

  await page.evaluate(() => {
    document.documentElement.dataset.glass = "disabled";
  });
  await expect(button).toHaveAttribute("data-glass-mode", "solid");

  await page.evaluate(() => {
    document.documentElement.dataset.glass = "enabled";
  });
  await expect(button).toHaveAttribute("data-glass-mode", /refraction|blur/);
});

test("Vue glass: actual background displacement, clear foreground, fallback", async ({
  page,
  browserName,
}, info) => {
  await openLab(page);
  await page.getByLabel("独立参数覆盖").check();
  for (const name of ["模糊", "底色不透明度", "高光", "折射"])
    await control(page, name, 0);
  const surface = page.locator('[data-ui="glass-button"]');
  const foreground = page.locator('[data-ui="foreground-probe"]');
  const flat = await surface.screenshot();
  const textBefore = await foreground.screenshot();
  await control(page, "折射", 1);
  await expect(surface).toHaveAttribute(
    "data-glass-mode",
    browserName === "chromium" ? "refraction" : "blur",
  );
  const refracted = await surface.screenshot();
  const textAfter = await foreground.screenshot();
  // Rounded corners expose the changing backdrop; compare only the opaque text area.
  const metadata = await sharp(textBefore).metadata();
  const textCrop = {
    left: 4,
    top: 4,
    width: metadata.width! - 8,
    height: metadata.height! - 8,
  };
  const beforePixels = await sharp(textBefore)
    .extract(textCrop)
    .raw()
    .toBuffer();
  const afterPixels = await sharp(textAfter).extract(textCrop).raw().toBuffer();
  expect(afterPixels.equals(beforePixels)).toBe(true);
  await info.attach("flat", { body: flat, contentType: "image/png" });
  await info.attach("refraction", {
    body: refracted,
    contentType: "image/png",
  });
  if (browserName === "chromium") {
    const a = await sharp(flat)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const b = await sharp(refracted).removeAlpha().raw().toBuffer();
    let changed = 0;
    // Count changes only along the rim, excluding all text / control-panel UI.
    for (let y = 2; y < a.info.height - 2; y++)
      for (let x = 2; x < a.info.width - 2; x++) {
        if (y > 12 && y < a.info.height - 12 && x > 12 && x < a.info.width - 12)
          continue;
        const i = (y * a.info.width + x) * 3;
        if (
          Math.abs(a.data[i] - b[i]) +
            Math.abs(a.data[i + 1] - b[i + 1]) +
            Math.abs(a.data[i + 2] - b[i + 2]) >
          30
        )
          changed++;
      }
    expect(changed).toBeGreaterThan(100);
  } else {
    expect(await page.locator("[data-veydeck-glass-filter]").count()).toBe(0);
    await expect(surface).toHaveCSS("backdrop-filter", /blur/);
  }
});

test("Vue glass: local override, live provider, Teleport theme and resource cleanup", async ({
  page,
  browserName,
}) => {
  await openLab(page);
  const mode = browserName === "chromium" ? "refraction" : "blur";
  await expect(page.getByRole("button", { name: "实色覆盖" })).toHaveAttribute(
    "data-glass-mode",
    "solid",
  );
  await page.getByRole("combobox", { name: "选择节点" }).click();
  await expect(page.getByRole("listbox")).toHaveAttribute(
    "data-glass-mode",
    mode,
  );
  await page.getByLabel("深色主题").check();
  await page.getByRole("combobox", { name: "选择节点" }).click();
  await expect(page.getByRole("listbox")).toHaveAttribute("data-theme", "dark");
  await page.locator('[data-ui="glass-provider"]').evaluate((element) => {
    (element as HTMLElement).style.setProperty("--vdl-bg-base", "#223344");
  });
  await expect(page.getByRole("listbox")).toHaveCSS("--vdl-bg-base", "#223344");
  await page.keyboard.press("Escape");
  await page.getByLabel("启用玻璃", { exact: true }).uncheck();
  await expect(page.locator('[data-ui="glass-button"]')).toHaveAttribute(
    "data-glass-mode",
    "solid",
  );
  await expect(page.locator("[data-veydeck-glass-filter]")).toHaveCount(0);
  await page.getByLabel("启用玻璃", { exact: true }).check();
  await expect(page.locator('[data-ui="glass-button"]')).toHaveAttribute(
    "data-glass-mode",
    mode,
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

test("Vue glass: input identity and focus survive live material changes", async ({
  page,
}) => {
  await openLab(page);
  const input = page.getByRole("textbox", { name: "配置草稿", exact: true });
  await input.fill("unsaved draft");
  await input.focus();
  await page.evaluate(() => {
    const original = document.activeElement;
    const slider = document.querySelector<HTMLInputElement>(
      'input[aria-label="整体强度"]',
    )!;
    slider.value = "0.2";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    (window as any).__originalInput = original;
  });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("unsaved draft");
  expect(
    await input.evaluate(
      (element) => element === (window as any).__originalInput,
    ),
  ).toBe(true);
});

test("Vue glass: card and teleported menu refract with blur off", async ({
  page,
  browserName,
}, info) => {
  test.skip(
    browserName !== "chromium",
    "Optical SVG evidence targets Chrome / Edge",
  );
  await openLab(page);
  await page.getByLabel("独立参数覆盖").check();
  for (const name of ["模糊", "底色不透明度", "高光", "折射"])
    await control(page, name, 0);
  await page.getByRole("combobox", { name: "选择节点" }).click();
  const card = page.locator('[data-ui="glass-card"]');
  const menu = page.getByRole("listbox");
  const flatCard = await card.screenshot();
  const flatMenu = await menu.screenshot();
  await control(page, "折射", 1);
  for (const [name, locator, flat] of [
    ["card", card, flatCard],
    ["menu", menu, flatMenu],
  ] as const) {
    await expect(locator).toHaveAttribute("data-glass-mode", "refraction");
    const refracted = await locator.screenshot();
    const a = await sharp(flat).removeAlpha().raw().toBuffer();
    const b = await sharp(refracted).removeAlpha().raw().toBuffer();
    expect(a.length).toBe(b.length);
    expect(
      a.reduce(
        (total, value, i) => total + (Math.abs(value - b[i]) > 12 ? 1 : 0),
        0,
      ),
    ).toBeGreaterThan(100);
    await info.attach(`${name}-flat`, { body: flat, contentType: "image/png" });
    await info.attach(`${name}-refracted`, {
      body: refracted,
      contentType: "image/png",
    });
  }
});

test("Vue glass: reduced transparency disables refraction", async ({
  page,
  browserName,
  context,
}) => {
  test.skip(
    browserName !== "chromium",
    "Native reduced-transparency emulation uses CDP",
  );
  await openLab(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect(page.locator('[data-ui="glass-button"]')).toHaveAttribute(
    "data-glass-mode",
    "solid",
  );
  await expect(page.locator("[data-veydeck-glass-filter]")).toHaveCount(0);
  await cdp.detach();
});

test("Vue glass: theme screenshots, narrow layout, accessible fallback", async ({
  page,
}, info) => {
  await openLab(page);
  for (const dark of [false, true]) {
    await page.getByLabel("深色主题").setChecked(dark);
    await expect(page.locator("main")).toHaveCSS(
      "background-color",
      dark ? "rgb(11, 16, 32)" : "rgb(244, 247, 251)",
    );
    // Existing reduced-motion tokens retain a 0.01ms transition duration.
    // Wait for descendant paint too, not only the root theme attribute/color.
    await expect(
      page.locator('[data-ui="glass-card"] .vl-card-header'),
    ).toHaveCSS(
      "background-color",
      dark ? "rgb(32, 43, 64)" : "rgb(241, 245, 249)",
    );
    await info.attach(dark ? "dark" : "light", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "打开详情" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveAttribute("data-theme", "dark");
  await expect(dialog.locator('[data-slot="glass-layer"]')).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await info.attach("narrow-dialog", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.emulateMedia({ forcedColors: "active" });
  await expect(page.locator('[data-ui="glass-button"]')).toHaveAttribute(
    "data-glass-mode",
    "solid",
  );
});

test("Vue glass: resize, scale, scroll and idle/performance evidence", async ({
  page,
  browser,
  browserName,
}, info) => {
  test.skip(
    browserName !== "chromium",
    "Performance evidence targets Chrome / Edge",
  );
  await openLab(page);
  await page.getByLabel("多实例压力场景").check();
  await page.getByLabel("独立参数覆盖").check();
  await page.locator('[data-ui="glass-stress"]').scrollIntoViewIfNeeded();
  await page.evaluate(() => (document.documentElement.style.zoom = "1.25"));
  await page.setViewportSize({ width: 1000, height: 850 });
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  const report = await page.evaluate(async () => {
    const longTasks: number[] = [];
    const observer = new PerformanceObserver((list) =>
      longTasks.push(...list.getEntries().map((e) => e.duration)),
    );
    observer.observe({ type: "longtask", buffered: false });
    const slider = document.querySelector<HTMLInputElement>(
      'input[aria-label="折射"]',
    )!;
    const frames: number[] = [];
    let previous = performance.now();
    for (let i = 0; i < 120; i++) {
      slider.value = String(0.2 + (i % 60) / 100);
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const now = performance.now();
      frames.push(now - previous);
      previous = now;
      window.scrollBy(0, i % 2 ? 4 : -4);
    }
    observer.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 150));
    let idleMutations = 0;
    const mutations = new MutationObserver(
      (records) => (idleMutations += records.length),
    );
    document
      .querySelectorAll("[data-veydeck-glass-filter], .vl-glass")
      .forEach((node) =>
        mutations.observe(node, {
          attributes: true,
          childList: true,
          subtree: true,
        }),
      );
    await new Promise((resolve) => setTimeout(resolve, 300));
    mutations.disconnect();
    frames.sort((a, b) => a - b);
    return {
      p50: frames[60],
      p95: frames[114],
      max: frames.at(-1),
      longTasks,
      idleMutations,
      filters: document.querySelectorAll("[data-veydeck-glass-filter]").length,
      userAgent: navigator.userAgent,
    };
  });
  expect(report.idleMutations).toBe(0);
  expect(report.filters).toBeGreaterThanOrEqual(24);
  await info.attach("performance", {
    body: JSON.stringify(
      {
        ...report,
        browser: browser.version(),
        cpu: os.cpus()[0]?.model,
        logicalCpus: os.cpus().length,
        platform: os.platform(),
        headless: true,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
