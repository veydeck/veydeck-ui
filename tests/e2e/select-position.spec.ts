import { expect, test } from "@playwright/test";

for (const app of [
  { name: "Vue", url: "http://127.0.0.1:4173" },
  { name: "React", url: "http://127.0.0.1:4174" },
]) {
  test(`${app.name} Select 在视口边缘向上展开`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(app.url);
    const demo = page.locator('[data-ui="qa-select"]');
    await demo.evaluate((element) =>
      element.scrollIntoView({ block: "end", inline: "nearest" }),
    );
    await demo.getByRole("combobox").click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toHaveAttribute("data-placement", "top");
    const box = await listbox.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(8);
    expect(box!.x + box!.width).toBeLessThanOrEqual(312);
    expect(box!.y).toBeGreaterThanOrEqual(8);
    expect(box!.y + box!.height).toBeLessThanOrEqual(560);
  });
}
