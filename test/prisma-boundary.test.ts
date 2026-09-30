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

    // No DATABASE_URL means no Prisma adapter is attached; the module still
    // loads, so importing it cannot throw.
    expect(authOptions.adapter).toBeUndefined();
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("disables sign-in cleanly when no OAuth credentials are configured", async () => {
    const { authOptions } = await import("@/lib/auth/auth-options");

    expect(authOptions.providers).toHaveLength(0);
    // A throwaway secret keeps /api/auth/* answering instead of 500-ing.
    expect(authOptions.secret).toBeTruthy();
  });

  it("registers the Google provider when credentials are present", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");

    const { authOptions } = await import("@/lib/auth/auth-options");

    expect(authOptions.providers).toHaveLength(1);
  });

  it("does not silently fall back to a guessable secret when OAuth is live", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");
    // NEXTAUTH_SECRET deliberately left unset.

    const { authOptions } = await import("@/lib/auth/auth-options");

    // Real credentials without a secret is a misconfiguration: it must fail
    // loudly rather than sign sessions with a hardcoded key.
    expect(authOptions.secret).toBeUndefined();
  });

  it("fails clearly when an operation needs the database", async () => {
    const { prisma } = await import("@/lib/prisma");

    await expect(async () => {
      await prisma.user.findMany();
    }).rejects.toThrow("DATABASE_URL is not set");
  });
});
