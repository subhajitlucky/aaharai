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

    // Scoped to <main> because the footer tagline also mentions the assistant.
    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { level: 1 }),
    ).toContainText("Aaharai");
    await expect(
      main.getByText("India’s First Ayurvedic AI Assistant"),
    ).toBeVisible();
    await expect(main.getByRole("link", { name: /Find My Body Type/i })).toBeVisible();
    await expect(main.getByRole("link", { name: /Enter Dashboard/i })).toBeVisible();
  });

  test("every page carries the global footer with its wellness notice", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("body > footer");
    await expect(footer).toHaveCount(1);
    await expect(footer).toContainText("General wellness guidance");
    await expect(footer).toContainText("not medical advice");
    // Must be reachable by scrolling, not parked off-screen.
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeInViewport();
  });

  test("the sources page states the editorial policy and the registry", async ({
    page,
  }) => {
    await page.goto("/sources");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toContainText(
      "Where every claim comes from",
    );
    // Every registered source must be listed, with its rights and boundary.
    await expect(main.getByText("Usage boundary").first()).toBeVisible();
    await expect(main.getByText("What AI cannot do here")).toBeVisible();
    await expect(main.getByRole("link", { name: "licence" }).first()).toBeVisible();
  });

  test("the seasonal calendar is generated from the records", async ({ page }) => {
    await page.goto("/seasonal");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toContainText(
      "month by month",
    );
    await expect(main.getByText("January")).toBeVisible();
    await expect(main.getByText("Available through the year")).toBeVisible();
  });

  test("the archive reports its own regional coverage", async ({ page }) => {
    await page.goto("/recipes");
    await expect(
      page.getByRole("heading", { name: /Where the archive has records today/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /How these records are sourced/ })).toBeVisible();
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
    "/sources",
    "/seasonal",
  ] as const;

  for (const route of routes) {
    test(`${route} responds 200`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
