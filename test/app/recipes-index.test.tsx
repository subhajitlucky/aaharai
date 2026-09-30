import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecipesIndexContent } from "@/app/recipes/page";

describe("recipe index states", () => {
  it("renders the source-cited empty state without catalog data", () => {
    render(<RecipesIndexContent recipes={[]} />);

    expect(screen.getByRole("heading", { name: "No verified recipes yet" })).toBeInTheDocument();
    expect(screen.getByText("The first source-cited record is still being transcribed. Check back soon — nothing unverified ever appears here.")).toBeInTheDocument();
  });
});
