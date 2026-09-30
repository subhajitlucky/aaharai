import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
const navbarSource = readFileSync(
  new URL("../components/Navbar.tsx", import.meta.url),
  "utf8",
);
const homeSource = readFileSync(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);

describe("application shell contract", () => {
  it("keeps navigation and page content in stable landmarks", () => {
    expect(layoutSource).toContain('<main id="main-content"');
    expect(layoutSource).toMatch(
      /<Navbar\s*\/>[\s\S]*<main id="main-content"[^>]*>\s*\{children\}\s*<\/main>/,
    );
    expect(navbarSource).toMatch(
      /<nav\s+aria-label="Primary navigation"/,
    );
    expect(homeSource).not.toMatch(/<main\b/);
  });
});
