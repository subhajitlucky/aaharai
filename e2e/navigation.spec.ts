import { expect, test } from "@playwright/test";

/**
 * Regression cover for the navigation shell.
 *
 * The desktop link row needs ~1100px for all seven destinations, so it is only
 * rendered from the xl breakpoint up. Below that the panel menu carries the
 * links — previously those links were simply hidden below `md` with no panel,
 * which left phones with no navigation at all.
 */

test.describe("mobile navigation", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1280, "mobile-only");

  test("exposes every destination through the menu button", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toBeVisible();

    const panel = page.locator("#mobile-menu");
    await expect(panel).toHaveCount(0);

    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    // All seven primary destinations must be reachable by touch.
    await expect(panel.locator("a")).toHaveCount(7);

    // Touch targets must clear the 44px minimum.
    const heights = await panel
      .locator("a")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  });

  test("closes the menu after navigating and on Escape", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const panel = page.locator("#mobile-menu");
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(panel).toBeVisible();
    await panel.getByRole("link", { name: "Recipes" }).click();

    await expect(page).toHaveURL(/\/recipes$/);
    await expect(panel).toHaveCount(0);
  });

  test("marks exactly one link as the current page", async ({ page }) => {
    await page.goto("/recipes");

    await expect(page.locator('a[aria-current="page"]')).toHaveCount(1);
  });
});

test.describe("layout", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/recipes/bengal-khichuri", {
        waitUntil: "networkidle",
      });

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("the nutrition table scrolls instead of clipping its columns", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/recipes/bengal-khichuri", { waitUntil: "networkidle" });

    const wrapper = page.locator('table:has(th:has-text("Nutrient"))')
      .locator("xpath=..");
    await expect(wrapper).toHaveCSS("overflow-x", "auto");

    // The "Status" column exists and is reachable by scrolling the card.
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeAttached();
  });
});
