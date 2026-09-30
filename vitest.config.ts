import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        // These globs are forward-looking guards for the stable module
        // directories named in docs/plans/2026-09-25-living-food-atlas-redesign.md
        // (`lib/planner/`, `lib/storage/`, and the `lib/ai/` provider adapter).
        // `lib/planner/**`, `lib/storage/**` and `lib/ai/**` therefore match
        // nothing yet and are not enforced until those directories land.
        //
        // Legacy `lib/ai.ts` is deliberately NOT thresholded: it is on its way
        // out, superseded by the `lib/ai/` adapter. This is asserted by
        // test/content/task3-remaining-gaps.test.ts — do not "fix" it by
        // pointing a threshold at lib/ai.ts.
        "lib/domain/**": {
          statements: 80,
          lines: 80,
          functions: 80,
          branches: 80,
        },
        "lib/planner/**": {
          statements: 80,
          lines: 80,
          functions: 80,
          branches: 80,
        },
        "lib/storage/**": {
          statements: 80,
          lines: 80,
          functions: 80,
          branches: 80,
        },
        "lib/ai/**": {
          statements: 80,
          lines: 80,
          functions: 80,
          branches: 80,
        },
      },
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["test/**/*.test.ts"],
          exclude: ["test/**/*.test.tsx"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["test/**/*.test.tsx"],
          setupFiles: ["./test/setup.ts"],
        },
      },
    ],
  },
});
