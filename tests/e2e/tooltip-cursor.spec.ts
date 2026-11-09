import { expect, test } from "@playwright/test";

for (const app of [
  { name: "vue", url: "http://127.0.0.1:4173" },
  { name: "react", url: "http://127.0.0.1:4174" },
]) {
  test(`${app.name} Tooltip 跟随鼠标且默认保持锚定`, async ({ page }) => {
    await page.goto(app.url);
    const trigger = page.locator('[data-ui="qa-tooltip-follow-cursor"]');
    await trigger.scrollIntoViewIfNeeded();
    const bounds = (await trigger.boundingBox())!;
    await page.mouse.move(bounds.x + 10, bounds.y + 10);
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    const first = (await tooltip.boundingBox())!;
    await page.mouse.move(bounds.x + 40, bounds.y + 15);
    await expect
      .poll(async () => (await tooltip.boundingBox())!.x)
      .toBeCloseTo(first.x + 30, 0);
    await expect
      .poll(async () => (await tooltip.boundingBox())!.y)
      .toBeCloseTo(first.y + 5, 0);
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);

    const anchored = page.locator('[data-ui="qa-tooltip"]');
    await anchored.scrollIntoViewIfNeeded();
    const anchoredBounds = (await anchored.boundingBox())!;
    await page.mouse.move(anchoredBounds.x + 10, anchoredBounds.y + 10);
    await expect(tooltip).toBeVisible();
    const anchoredFirst = (await tooltip.boundingBox())!;
    await page.mouse.move(anchoredBounds.x + 40, anchoredBounds.y + 15);
    await expect
      .poll(async () => (await tooltip.boundingBox())!.x)
      .toBeCloseTo(anchoredFirst.x, 2);
    await expect
      .poll(async () => (await tooltip.boundingBox())!.y)
      .toBeCloseTo(anchoredFirst.y, 2);
  });
}
