import { expect, test } from "@playwright/test";

/**
 * Contrast regression guard.
 *
 * The palette shipped with brand clay #E07A5F, which reached only 2.60:1 on
 * the sand background and 2.95:1 under white text, so essentially every
 * accent-coloured string failed WCAG AA. The tokens were corrected in
 * globals.css; this spec exists so a future palette tweak cannot silently
 * reintroduce unreadable text.
 */

const PAGES = [
  "/",
  "/recipes",
  "/recipes/bengal-khichuri",
  "/scanner",
  "/nuskhe",
  "/library",
  "/science",
  "/dinacharya",
  "/swapper",
  "/dashboard",
  "/prakriti-test",
];

/** Runs in the page: resolves computed colours and returns failing nodes. */
function collectFailures() {
  const oklabToRgb = (L: number, a: number, b: number) => {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const q = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    const enc = (u: number) => {
      u = u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(Math.max(u, 0), 1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, u)) * 255);
    };
    return [enc(r), enc(g), enc(q)];
  };

  const parse = (raw: string | null): [number, number, number, number] | null => {
    if (!raw) return null;
    const s = raw.trim();
    let m = s.match(/^oklab\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split("/");
      const p = parts[0].trim().split(/\s+/).map(Number);
      return [
        ...(oklabToRgb(p[0], p[1], p[2]) as [number, number, number]),
        parts[1] !== undefined ? parseFloat(parts[1]) : 1,
      ];
    }
    m = s.match(/^rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    }
    return null;
  };

  const lum = ([r, g, b]: number[]) => {
    const f = (v: number) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a: number[], b: number[]) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const flatten = (c: number[], bg: number[]) =>
    [0, 1, 2].map((i) => Math.round(c[i] * c[3] + bg[i] * (1 - c[3]))) as number[];

  const backdropOf = (el: Element) => {
    let node: Element | null = el;
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c[3] > 0.999) return c;
      node = node.parentElement;
    }
    return [244, 241, 222, 1];
  };

  const failures: string[] = [];
  for (const el of document.querySelectorAll("p,span,a,li,h1,h2,h3,h4,button,td,th")) {
    if (!el.textContent?.trim()) continue;
    if (el.querySelector("p,span,a,li,h1,h2,h3,h4")) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none") continue;
    const bg = backdropOf(el);
    const fgRaw = parse(st.color);
    if (!fgRaw) continue;
    const fg = flatten(fgRaw, bg);
    const size = parseFloat(st.fontSize);
    const bold = Number(st.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    const cr = ratio(fg, bg.slice(0, 3));
    if (cr < need) {
      failures.push(
        `"${el.textContent.trim().replace(/\s+/g, " ").slice(0, 40)}" ${cr.toFixed(2)}:1 (needs ${need})`,
      );
    }
  }
  return failures;
}

test.describe("WCAG AA text contrast", () => {
  for (const path of PAGES) {
    test(`${path} has no failing text`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const failures = await page.evaluate(collectFailures);
      expect(failures, `contrast failures on ${path}:\n${failures.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("social metadata", () => {
  test("exposes Open Graph and Twitter card tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  });

  test("does not double the site name into page titles", async ({ page }) => {
    await page.goto("/recipes");
    const title = await page.title();
    expect(title).toBe("Source-cited Recipes | Aaharai");
  });
});
