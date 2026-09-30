import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Prisma boundary", () => {
  it("imports auth configuration without a configured database", async () => {
    const { authOptions } = await import("@/lib/auth/auth-options");

    expect(authOptions.providers).toHaveLength(1);
  });

  it("fails clearly when an operation needs the database", async () => {
    const { prisma } = await import("@/lib/prisma");

    await expect(async () => {
      await prisma.user.findMany();
    }).rejects.toThrow("DATABASE_URL is not set");
  });
});
