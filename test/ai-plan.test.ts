import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * lib/ai.ts reads OPENROUTER_API_KEY and NEXT_PUBLIC_SITE_URL at module load
 * time, so every test re-imports the module after resetting it.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** Import lib/ai with the given env applied. */
async function loadAi(env: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  return import("@/lib/ai");
}

function openRouterResponse(content: string) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
}

describe("generateMealPlan without an API key", () => {
  it("returns a deterministic mock plan and never calls the network", async () => {
    const { generateMealPlan } = await loadAi({ OPENROUTER_API_KEY: "" });

    const plan = await generateMealPlan("Vata");

    expect(plan.breakfast.name).toBe("Warm Oatmeal with Ghee & Almonds");
    expect(plan.lunch.name).toBe("Kitchari (Moong Dal & Rice)");
    expect(plan.dinner.name).toBe("Pumpkin Soup");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the mock plan for every known dosha", async () => {
    const { generateMealPlan } = await loadAi({ OPENROUTER_API_KEY: "" });

    expect((await generateMealPlan("Pitta")).breakfast.name).toBe(
      "Cooling Fruit Bowl",
    );
    expect((await generateMealPlan("Kapha")).breakfast.name).toBe(
      "Spiced Quinoa Porridge",
    );
  });

  it("falls back to the Vata plan for an unrecognised dosha", async () => {
    const { generateMealPlan } = await loadAi({ OPENROUTER_API_KEY: "" });

    expect((await generateMealPlan("NotADosha")).breakfast.name).toBe(
      "Warm Oatmeal with Ghee & Almonds",
    );
  });
});

describe("generateMealPlan with an API key", () => {
  const key = { OPENROUTER_API_KEY: "unit-test-openrouter-key" };

  it("sends the key and site attribution headers", async () => {
    fetchMock.mockResolvedValue(
      openRouterResponse(JSON.stringify({ breakfast: {}, lunch: {}, dinner: {} })),
    );

    const { generateMealPlan } = await loadAi({
      ...key,
      NEXT_PUBLIC_SITE_URL: "https://aaharai.example",
    });
    await generateMealPlan("Pitta");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer unit-test-openrouter-key");
    expect(init.headers["HTTP-Referer"]).toBe("https://aaharai.example");
    expect(init.headers["X-Title"]).toBe("Aaharai");
  });

  it("defaults the referer to localhost when no public site URL is set", async () => {
    fetchMock.mockResolvedValue(
      openRouterResponse(JSON.stringify({ breakfast: {}, lunch: {}, dinner: {} })),
    );

    const { generateMealPlan } = await loadAi({ ...key, NEXT_PUBLIC_SITE_URL: "" });
    await generateMealPlan("Kapha");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["HTTP-Referer"]).toBe("http://localhost:3000");
  });

  it("includes the requested dosha and the vegetarian rule in the prompt", async () => {
    fetchMock.mockResolvedValue(
      openRouterResponse(JSON.stringify({ breakfast: {}, lunch: {}, dinner: {} })),
    );

    const { generateMealPlan } = await loadAi(key);
    await generateMealPlan("Kapha");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    const prompt = body.messages[1].content as string;
    expect(prompt).toContain("Kapha");
    expect(prompt).toContain("Vegetarian");
    expect(body.model).toContain("free");
  });

  it("parses a plain JSON response", async () => {
    const plan = {
      breakfast: { name: "A", description: "B", benefits: "C" },
      lunch: { name: "D", description: "E", benefits: "F" },
      dinner: { name: "G", description: "H", benefits: "I" },
    };
    fetchMock.mockResolvedValue(openRouterResponse(JSON.stringify(plan)));

    const { generateMealPlan } = await loadAi(key);

    await expect(generateMealPlan("Vata")).resolves.toEqual(plan);
  });

  it("strips markdown code fences around the JSON payload", async () => {
    fetchMock.mockResolvedValue(
      openRouterResponse(
        '```json\n{"breakfast":{"name":"Fenced"},"lunch":{},"dinner":{}}\n```',
      ),
    );

    const { generateMealPlan } = await loadAi(key);

    await expect(generateMealPlan("Vata")).resolves.toMatchObject({
      breakfast: { name: "Fenced" },
    });
  });

  it("degrades to the mock plan when the network rejects", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const { generateMealPlan } = await loadAi(key);

    await expect(generateMealPlan("Pitta")).resolves.toMatchObject({
      breakfast: { name: "Cooling Fruit Bowl" },
    });
  });

  it("degrades to the mock plan when the provider returns no content", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: {} }] }),
    });

    const { generateMealPlan } = await loadAi(key);

    await expect(generateMealPlan("Vata")).resolves.toMatchObject({
      breakfast: { name: "Warm Oatmeal with Ghee & Almonds" },
    });
  });

  it("degrades to the mock plan when the response is not valid JSON", async () => {
    fetchMock.mockResolvedValue(openRouterResponse("I am a teapot, not JSON"));

    const { generateMealPlan } = await loadAi(key);

    await expect(generateMealPlan("Kapha")).resolves.toMatchObject({
      breakfast: { name: "Spiced Quinoa Porridge" },
    });
  });
});
