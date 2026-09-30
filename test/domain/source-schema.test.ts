import { describe, expect, it } from "vitest";
import { sourceSchema } from "@/lib/domain/source";

const representativeSource = {
  id: "src-community-cookbook",
  title: "Community cookbook",
  sourceType: "community-cookbook",
  citation: "Community cookbook, 2024, p. 12",
  url: "https://example.com/source",
  accessedAt: "2026-09-25",
  rights: "cited",
  rightsEvidence: "The citation is recorded for fact-checking and is not presented as a license grant.",
  usageBoundary: "Only the citation and independently written adaptation are retained.",
  reviewedBy: "Aaharai AI-assisted source audit",
  reviewedAt: "2026-09-25",
};

describe("source schema", () => {
  it("accepts a representative reviewed source", () => {
    expect(sourceSchema.safeParse(representativeSource).success).toBe(true);
  });

  it("rejects invalid source IDs", () => {
    expect(sourceSchema.safeParse({ ...representativeSource, id: "source-1" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, id: "src_1" }).success).toBe(false);
  });

  it("rejects unsupported source types and rights", () => {
    expect(
      sourceSchema.safeParse({ ...representativeSource, sourceType: "website" }).success,
    ).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, rights: "unknown" }).success).toBe(false);
  });

  it("rejects invalid URLs and ISO review dates", () => {
    expect(sourceSchema.safeParse({ ...representativeSource, url: "not-a-url" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, reviewedAt: "2026-02-30" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, accessedAt: "2026-9-25" }).success).toBe(false);
  });

  it("accepts only HTTP and HTTPS source URLs", () => {
    expect(sourceSchema.safeParse({ ...representativeSource, url: "http://example.com/source" }).success).toBe(true);
    expect(sourceSchema.safeParse({ ...representativeSource, url: "https://example.com/source" }).success).toBe(true);
    expect(sourceSchema.safeParse({ ...representativeSource, url: "javascript:alert(1)" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, url: "data:text/plain,source" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, url: "ftp://example.com/source" }).success).toBe(false);
  });

  it("rejects human-expert reviewer claims and dates outside the audit", () => {
    expect(sourceSchema.safeParse({ ...representativeSource, reviewedBy: "Community expert" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, reviewedAt: "2026-09-24" }).success).toBe(false);
  });

  it("requires a named reviewer and non-empty citation", () => {
    expect(sourceSchema.safeParse({ ...representativeSource, reviewedBy: "" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...representativeSource, citation: "" }).success).toBe(false);
  });
});
