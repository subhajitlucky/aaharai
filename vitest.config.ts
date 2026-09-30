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
