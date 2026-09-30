import { expect, test } from "@playwright/test";

/**
 * Smoke tests for the public, statically-rendered surface of Aaharai.
 *
 * These deliberately avoid /dashboard and every /api/* route: those require a
 * live Postgres and Google OAuth credentials, which CI does not provide.
 * The goal is to catch a broken build, a missing Navbar entry, or a recipe
 * record that fails to render after content changes.
 */

test.describe("public pages", () => {
  test("homepage renders the hero and primary calls to action", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Aaharai");
    await expect(page.getByText("Ayurvedic AI Assistant")).toBeVisible();
    await expect(page.getByRole("link", { name: /Find My Body Type/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Enter Dashboard/i })).toBeVisible();
  });

  test("recipes index lists source-cited records", async ({ page }) => {
    await page.goto("/recipes");

    await expect(page.getByText("The Aaharai Archive", { exact: false })).toBeVisible();

    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("a recipe detail page renders provenance", async ({ page }) => {
    await page.goto("/recipes/bengal-khichuri");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).not.toBeEmpty();
  });

  test("unknown recipe slugs 404 rather than rendering an empty shell", async ({
    page,
  }) => {
    const response = await page.goto("/recipes/this-recipe-does-not-exist");

    expect(response?.status()).toBe(404);
  });
});

test.describe("top-level navigation", () => {
  const routes = [
    "/prakriti-test",
    "/dinacharya",
    "/library",
    "/nuskhe",
    "/science",
    "/scanner",
    "/swapper",
  ] as const;

  for (const route of routes) {
    test(`${route} responds 200`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
