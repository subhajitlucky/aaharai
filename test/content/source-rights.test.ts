import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sourceCatalogSchema } from "@/lib/domain/source";

const root = process.cwd();

function readSources() {
  return sourceCatalogSchema.parse(
    JSON.parse(readFileSync(join(root, "content", "sources", "index.json"), "utf8")),
  );
}

describe("source rights registry", () => {
  it("contains no restricted IFCT dependency", () => {
    const sourceText = readFileSync(join(root, "content", "sources", "index.json"), "utf8");
    expect(sourceText).not.toContain("src-ifct-2017");
  });

  it("records USDA as public domain and the Jain fallback as licensed", () => {
    const sources = readSources().sources;
    const usda = sources.find((source) => source.id === "src-usda-fdc-sr-legacy-2018");
    const jain = sources.find((source) => source.id === "src-jain-dosa-mit-2020");

    expect(usda).toMatchObject({
      rights: "public-domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    });
    expect(jain).toMatchObject({
      rights: "licensed",
      licenseUrl: "https://github.com/JainRecipes/JainRecipes.github.io/blob/64c6a8b63dd210a2d61e5289572d8fda48355323/LICENSE.txt",
    });
    expect(sources.every((source) => source.rightsEvidence.length > 0 && source.usageBoundary.length > 0)).toBe(true);
    expect(sources.every((source) => source.reviewedBy === "Aaharai AI-assisted source audit" && source.reviewedAt === "2026-09-25")).toBe(true);
  });
});
