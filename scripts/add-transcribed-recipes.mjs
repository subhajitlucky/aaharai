import { readFileSync, writeFileSync } from "node:fs";

const root = process.cwd();
const read = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));
const write = (p, v) => writeFileSync(`${root}/${p}`, JSON.stringify(v, null, 2) + "\n");

const ingredientsFile = read("content/foods/ingredients.json");
const manifestFile = read("content/nutrition/manifest.json");
const reviewFile = read("content/reviews/review-evidence.json");
const fidelityFile = read("content/source-fidelity.json");

// ---- Reuse the exact USDA sourceValues already in the manifest ----
const usda = new Map();
for (const entry of manifestFile.entries) {
  for (const ing of entry.ingredients) {
    if (ing.includedInNutrition === false) continue;
    if (!ing.sourceFoodId) continue;
    usda.set(ing.ingredientId, {
      sourceFoodId: ing.sourceFoodId,
      sourceFoodDescription: ing.sourceFoodDescription,
      sourceValues: ing.sourceValues,
    });
  }
}

// ---- New ingredients, values fetched live from USDA FDC (SR Legacy) ----
const NEW_USDA = {
  "ingredient-walnut": {
    sourceFoodId: 170187,
    sourceFoodDescription: "Nuts, walnuts, english",
    sourceValues: [
      { nutrient: "energy", amount: 654, unit: "kcal" },
      { nutrient: "protein", amount: 15.2, unit: "g" },
      { nutrient: "total fat", amount: 65.2, unit: "g" },
      { nutrient: "carbohydrate", amount: 13.7, unit: "g" },
    ],
  },
  "ingredient-almond": {
    sourceFoodId: 170567,
    sourceFoodDescription: "Nuts, almonds",
    sourceValues: [
      { nutrient: "energy", amount: 579, unit: "kcal" },
      { nutrient: "protein", amount: 21.2, unit: "g" },
      { nutrient: "total fat", amount: 49.9, unit: "g" },
      { nutrient: "carbohydrate", amount: 21.6, unit: "g" },
    ],
  },
  "ingredient-saffron": {
    sourceFoodId: 170934,
    sourceFoodDescription: "Spices, saffron",
    sourceValues: [
      { nutrient: "energy", amount: 310, unit: "kcal" },
      { nutrient: "protein", amount: 11.4, unit: "g" },
      { nutrient: "total fat", amount: 5.85, unit: "g" },
      { nutrient: "carbohydrate", amount: 65.4, unit: "g" },
    ],
  },
  "ingredient-raisins": {
    sourceFoodId: 168164,
    sourceFoodDescription: "Raisins, golden, seedless",
    sourceValues: [
      { nutrient: "energy", amount: 301, unit: "kcal" },
      { nutrient: "protein", amount: 3.28, unit: "g" },
      { nutrient: "total fat", amount: 0.2, unit: "g" },
      { nutrient: "carbohydrate", amount: 80, unit: "g" },
    ],
  },
  "ingredient-dates": {
    sourceFoodId: 168191,
    sourceFoodDescription: "Dates, medjool",
    sourceValues: [
      { nutrient: "energy", amount: 277, unit: "kcal" },
      { nutrient: "protein", amount: 1.81, unit: "g" },
      { nutrient: "total fat", amount: 0.15, unit: "g" },
      { nutrient: "carbohydrate", amount: 75, unit: "g" },
    ],
  },
};
for (const [id, v] of Object.entries(NEW_USDA)) usda.set(id, v);

// ---- Register the new ingredients ----
const NEW_INGREDIENTS = [
  { id: "ingredient-walnut", name: "Walnut", regional: [["Walnut", "Kashmir"]], diet: ["vegan","vegetarian","dairy-free","gluten-free"], allergens: ["tree-nuts"], form: "raw kernels" },
  { id: "ingredient-almond", name: "Almond", regional: [["Badam", "Kashmir"]], diet: ["vegan","vegetarian","dairy-free","gluten-free"], allergens: ["tree-nuts"], form: "blanched and split" },
  { id: "ingredient-saffron", name: "Saffron", regional: [["Kesar", "Kashmir"]], diet: ["vegan","vegetarian","dairy-free","gluten-free","nut-free"], allergens: [], form: "dried strands" },
  { id: "ingredient-raisins", name: "Raisins", regional: [["Mishmish", "India"]], diet: ["vegan","vegetarian","dairy-free","gluten-free","nut-free"], allergens: [], form: "golden seedless" },
  { id: "ingredient-dates", name: "Dates", regional: [["Khajoor", "India"]], diet: ["vegan","vegetarian","dairy-free","gluten-free","nut-free"], allergens: [], form: "dried medjool" },
];
for (const n of NEW_INGREDIENTS) {
  if (ingredientsFile.ingredients.some((i) => i.id === n.id)) continue;
  ingredientsFile.ingredients.push({
    id: n.id,
    canonicalName: n.name,
    regionalNames: n.regional.map(([name, region]) => ({ name, region })),
    dietTags: n.diet,
    allergenIds: n.allergens,
    defaultUnit: "g",
    nutritionSourceIds: ["src-usda-fdc-sr-legacy-2018"],
    substitutionIds: [],
    form: n.form,
    baseIngredient: false,
    nutritionNote: `The selected USDA SR Legacy row is ${n.form}; values are per 100 g as published in that release.`,
  });
}

// ---- Recipes transcribed from the verified ICAR source ----
const RECIPES = [
  {
    slug: "kashmiri-pulao",
    title: "Kashmiri Pulao",
    nativeName: { text: "Kashmiri Pulao", script: "latin" },
    state: "Jammu and Kashmir",
    community: "Kashmiri",
    languageNote: "The source prints the dish name in English under a Jammu & Kashmir heading; no separate native-script spelling is asserted here.",
    occasions: ["everyday", "festive"],
    season: [1, 12],
    mealCategory: "main-course",
    servings: 6,
    totalTimeMinutes: 60,
    difficulty: "medium",
    costTier: "medium",
    dietaryTags: ["vegetarian"],
    allergens: ["milk", "tree-nuts"],
    ingredients: [
      { id: "ingredient-rice", qty: 500, unit: "g", note: "long grain" },
      { id: "ingredient-onion", qty: 100, unit: "g", note: "sliced vertically" },
      { id: "ingredient-cinnamon", qty: 5, unit: "g" },
      { id: "ingredient-cardamom", qty: 5, unit: "g" },
      { id: "ingredient-cloves", qty: 5, unit: "g" },
      { id: "ingredient-turmeric", qty: 1, unit: "g", note: "a pinch" },
      { id: "ingredient-saffron", qty: 1, unit: "g" },
      { id: "ingredient-milk", qty: 10, unit: "ml", note: "warm, for dissolving saffron" },
      { id: "ingredient-walnut", qty: 20, unit: "g" },
      { id: "ingredient-cashew", qty: 20, unit: "g" },
      { id: "ingredient-vegetable-oil", qty: 50, unit: "g" },
      { id: "ingredient-water", qty: 1000, unit: "ml", exclude: "cooking liquid; excluded from nutrient totals" },
      { id: "ingredient-salt", qty: 10, unit: "g", exclude: "to taste; excluded from nutrient totals" },
    ],
    steps: [
      { text: "Wash and soak the long grain rice.", technique: "soaking" },
      { text: "Heat the oil and fry the sliced onions until golden brown, then remove them.", technique: "deep-frying aromatics" },
      { text: "Fry the whole spices and turmeric powder, add the rice, and saute.", technique: "tempering" },
      { text: "Add half the saffron dissolved in a little warm milk, then the hot water, and mix well. Cook briefly.", technique: "sautéing" },
      { text: "Add the remaining saffron and cook until the grains are separated and done.", technique: "absorption cooking" },
      { text: "Garnish with the fried onions, walnuts, and cashew nuts.", technique: "garnishing" },
    ],
    variations: [
      { label: "Kashmiri Pulao II", note: "The source prints a second, differently seasoned variant on the following page. It is recorded separately rather than merged, because the spice and fruit sets differ." },
    ],
    sourceTerms: ["Kashmiri Pulao", "long grain rice", "saffron", "walnut", "cashew"],
    authenticity:
      "The ICAR-Central Rice Research Institute source places Kashmiri Pulao under a Jammu & Kashmir heading. This record normalizes the published weights and does not claim an unbroken historical lineage or community testing. Nutrition is an independently recomputed estimate from the versioned USDA manifest; no laboratory recipe analysis is claimed.",
    adaptations: [
      "Source weights are taken as printed; the pinch of turmeric and the salt are normalized to gram weights for repeatable scaling.",
      "The fried onion is removed after frying and returned as a garnish, matching the source sequence.",
    ],
  },
  {
    slug: "modur-pulao",
    title: "Modur Pulao",
    nativeName: { text: "Modur Pulao", script: "latin" },
    state: "Jammu and Kashmir",
    community: "Kashmiri Muslim",
    languageNote: "The source prints the dish name in English under a Jammu & Kashmir heading. Modur is the Kashmiri term for a festive cooked rice dish; no script spelling is asserted here.",
    occasions: ["festive"],
    season: [1, 12],
    mealCategory: "dessert",
    servings: 8,
    totalTimeMinutes: 90,
    difficulty: "medium",
    costTier: "medium",
    dietaryTags: ["vegetarian"],
    allergens: ["milk", "tree-nuts"],
    ingredients: [
      { id: "ingredient-rice", qty: 320, unit: "g", note: "long grain basmati, from 2 cups" },
      { id: "ingredient-sugar", qty: 400, unit: "g", note: "from 2 cups" },
      { id: "ingredient-ghee", qty: 110, unit: "g", note: "from 1/2 cup" },
      { id: "ingredient-cardamom", qty: 2, unit: "g", note: "whole, 1/2 tsp" },
      { id: "ingredient-cloves", qty: 2, unit: "g", note: "1/2 tsp" },
      { id: "ingredient-black-pepper", qty: 2, unit: "g", note: "black peppercorns, 1/2 tsp" },
      { id: "ingredient-cinnamon", qty: 2, unit: "g", note: "1/2 tsp" },
      { id: "ingredient-bay-leaf", qty: 1, unit: "g", note: "5 leaves" },
      { id: "ingredient-saffron", qty: 0.1, unit: "g" },
      { id: "ingredient-milk", qty: 30, unit: "ml", note: "2 tbsp, for soaking saffron" },
      { id: "ingredient-almond", qty: 60, unit: "g", note: "blanched and split, 1/2 cup" },
      { id: "ingredient-raisins", qty: 75, unit: "g", note: "1/2 cup" },
      { id: "ingredient-desiccated-coconut", qty: 40, unit: "g", note: "dry coconut slivers, 1/2 cup" },
      { id: "ingredient-dates", qty: 75, unit: "g", note: "dried, 1/2 cup" },
      { id: "ingredient-water", qty: 120, unit: "ml", exclude: "added with the sugar syrup; excluded from nutrient totals" },
    ],
    steps: [
      { text: "Wash and drain the rice and set it aside.", technique: "washing" },
      { text: "Boil the rice in 8 cups of water until three-quarters done, then drain and set aside.", technique: "parboiling" },
      { text: "Soak the saffron strands in 2 tbsp of milk and mix to a paste.", technique: "infusing" },
      { text: "Heat the ghee in a pan and add all the spices except the saffron; let them sizzle briefly.", technique: "tempering" },
      { text: "Add the sugar and one third cup of water and stir well, then add all the dry fruits and stir.", technique: "caramelising syrup" },
      { text: "Add the cooked rice along with the saffron liquid and mix carefully.", technique: "folding" },
      { text: "Cover and cook for an hour. When cooked, mix thoroughly and serve warm.", technique: "covered simmering" },
    ],
    variations: [],
    sourceTerms: ["Modur Pulao", "basmati rice", "saffron", "dry fruits", "ghee"],
    authenticity:
      "The ICAR-Central Rice Research Institute source places Modur Pulao under a Jammu & Kashmir heading. The cup and spoon measures are converted to grams here; that conversion is declared rather than implied. Nutrition is an independently recomputed estimate from the versioned USDA manifest.",
    adaptations: [
      "Source cup and spoon measures (2 cups rice, 2 cups sugar, 1/2 cup ghee, 1/2 tsp spices, 1/2 cup dry fruits) are converted to gram weights.",
      "Dry coconut slivers are mapped to the registered desiccated coconut ingredient; dried dates are mapped to medjool as the closest registered form.",
    ],
  },
  {
    slug: "pukhlein",
    title: "Pukhlein",
    nativeName: { text: "Pukhlein", script: "latin" },
    state: "Meghalaya",
    community: "Khasi",
    languageNote: "The source prints the dish name in English under a Meghalaya heading. Pukhlein is a Khasi fried rice-flour sweet; no script spelling is asserted here.",
    occasions: ["everyday", "festive"],
    season: [1, 12],
    mealCategory: "snack",
    servings: 6,
    totalTimeMinutes: 45,
    difficulty: "easy",
    costTier: "low",
    dietaryTags: ["vegetarian", "dairy-free"],
    allergens: [],
    ingredients: [
      { id: "ingredient-rice-flour", qty: 120, unit: "g", note: "from 1 cup" },
      { id: "ingredient-jaggery", qty: 120, unit: "g", note: "from 1/2 cup" },
      { id: "ingredient-water", qty: 480, unit: "ml", exclude: "for melting the jaggery; excluded from nutrient totals" },
      { id: "ingredient-vegetable-oil", qty: 180, unit: "g", note: "for deep frying" },
    ],
    steps: [
      { text: "Slightly roast the rice flour over a medium flame without letting it change colour.", technique: "dry-roasting" },
      { text: "Melt the jaggery with water to a thick syrup, without reaching string consistency, and pass it through a fine filter to remove the scum.", technique: "syrup preparation" },
      { text: "Add the rice flour to the syrup and mix to a smooth dough. Rest for at least fifteen minutes.", technique: "kneading" },
      { text: "Heat oil in a pan over a medium flame.", technique: "preheating oil" },
      { text: "Divide the dough, roll balls, and flatten them.", technique: "shaping" },
      { text: "Deep fry on both sides until golden brown, then drain on paper.", technique: "deep-frying" },
    ],
    variations: [],
    sourceTerms: ["Pukhlein", "rice flour", "jaggery", "deep frying"],
    authenticity:
      "The ICAR-Central Rice Research Institute source places Pukhlein under a Meghalaya heading. This record normalizes the cup measure to grams. Nutrition is an independently recomputed estimate from the versioned USDA manifest; frying absorption is not modeled.",
    adaptations: [
      "The 1 cup of rice flour and 1/2 cup of jaggery are converted to gram weights.",
      "Frying oil is counted at the stated quantity; actual absorbed oil is not modeled, so the fat figure is an upper-bound input rather than a measured value.",
    ],
  },
  {
    slug: "sel-roti",
    title: "Sel Roti",
    nativeName: { text: "Sel Roti", script: "latin" },
    state: "Sikkim",
    community: "Nepali",
    languageNote: "The source prints the dish name in English under a Sikkim heading. Sel roti is a Nepali rice doughnut; no script spelling is asserted here.",
    occasions: ["everyday", "festive"],
    season: [1, 12],
    mealCategory: "snack",
    servings: 6,
    totalTimeMinutes: 60,
    difficulty: "medium",
    costTier: "low",
    dietaryTags: ["vegetarian"],
    allergens: ["milk"],
    ingredients: [
      { id: "ingredient-rice", qty: 150, unit: "g", note: "raw rice, from 1 cup" },
      { id: "ingredient-sugar", qty: 50, unit: "g", note: "from 1/4 cup" },
      { id: "ingredient-ghee", qty: 75, unit: "g", note: "from 1/3 cup" },
      { id: "ingredient-water", qty: 120, unit: "ml", exclude: "1/2 cup; excluded from nutrient totals" },
      { id: "ingredient-cardamom", qty: 1, unit: "g", note: "powdered, 1/4 tsp" },
      { id: "ingredient-cloves", qty: 0.3, unit: "g", note: "powdered, a pinch" },
      { id: "ingredient-vegetable-oil", qty: 230, unit: "g", note: "for deep frying, from 250 ml" },
    ],
    steps: [
      { text: "Wash and soak the raw rice overnight.", technique: "soaking" },
      { text: "Drain and grind the soaked rice in a mixer grinder.", technique: "grinding" },
      { text: "Add the sugar, ghee, powdered cardamom and clove along with the water, and grind again to a thick paste.", technique: "grinding" },
      { text: "Transfer the batter to a jar and whisk with a spoon until fluffy.", technique: "whipping" },
      { text: "Heat the oil in a pan or kadhai over medium heat.", technique: "preheating oil" },
      { text: "Pour the batter into the hot oil in the shape of a circle and fry until golden brown on both sides.", technique: "deep-frying" },
      { text: "Drain and transfer to a plate. Cool and store in an airtight jar.", technique: "draining" },
    ],
    variations: [],
    sourceTerms: ["Sel Roti", "raw rice", "ghee", "deep frying", "Sikkim"],
    authenticity:
      "The ICAR-Central Rice Research Institute source places Sel Roti under a Sikkim heading. This record normalizes the cup and spoon measures to grams. Nutrition is an independently recomputed estimate from the versioned USDA manifest; frying absorption is not modeled.",
    adaptations: [
      "Source measures (1 cup rice, 1/4 cup sugar, 1/3 cup ghee, 1/2 cup water, 1/4 tsp cardamom, 250 ml oil) are converted to gram weights.",
      "Frying oil is counted at the stated quantity; actual absorbed oil is not modeled, so the fat figure is an upper-bound input rather than a measured value.",
    ],
  },
];

const round2 = (n) => Math.round(n * 100) / 100;

// The manifest `form` must match the catalog ingredient's declared form, which
// is what reference-validation cross-checks.
const catalogForm = (id) => {
  const found = ingredientsFile.ingredients.find((i) => i.id === id);
  if (!found) throw new Error(`ingredient ${id} is not registered in ingredients.json`);
  return found.form;
};

for (const r of RECIPES) {
  // Idempotent: drop any prior run's records for this slug before re-adding.
  const recipeId = `recipe-${r.slug}`;
  manifestFile.entries = manifestFile.entries.filter((e) => e.recipeId !== recipeId);
  reviewFile.entries = reviewFile.entries.filter((e) => e.recipeId !== recipeId);
  fidelityFile.records = fidelityFile.records.filter((e) => e.recipeId !== recipeId);

  const manifestIngredients = [];
  const totals = new Map();

  for (const ing of r.ingredients) {
    if (ing.exclude) {
      manifestIngredients.push({
        ingredientId: ing.id,
        quantity: ing.qty,
        unit: ing.unit,
        form: catalogForm(ing.id),
        sourceFoodId: null,
        sourceValues: [],
        contribution: [],
        includedInNutrition: false,
        exclusionReason: ing.exclude,
      });
      continue;
    }
    const src = usda.get(ing.id);
    if (!src) throw new Error(`no USDA source for ${ing.id} in ${r.slug}`);
    const contribution = src.sourceValues.map((v) => {
      const amount = round2((v.amount * ing.qty) / 100);
      const key = `${v.nutrient}|${v.unit}`;
      totals.set(key, (totals.get(key) ?? 0) + amount);
      return { nutrient: v.nutrient, amount, unit: v.unit };
    });
    manifestIngredients.push({
      ingredientId: ing.id,
      quantity: ing.qty,
      unit: ing.unit,
      form: catalogForm(ing.id),
      sourceFoodId: src.sourceFoodId,
      sourceFoodDescription: src.sourceFoodDescription,
      sourceFoodDataType: "SR Legacy",
      sourceValues: src.sourceValues,
      contribution,
      includedInNutrition: true,
      adaptation:
        ing.note ?? `Quantity taken from the registered source record; values are per 100 g as published in USDA SR Legacy.`,
    });
  }

  const totalsArr = [...totals.entries()].map(([key, sum]) => {
    const [nutrient, unit] = key.split("|");
    return { nutrient, amount: round2(sum / r.servings), unit };
  });
  const order = ["energy", "protein", "total fat", "carbohydrate", "dietary fibre"];
  totalsArr.sort(
    (a, b) =>
      (order.indexOf(a.nutrient) === -1 ? 99 : order.indexOf(a.nutrient)) -
      (order.indexOf(b.nutrient) === -1 ? 99 : order.indexOf(b.nutrient)),
  );

  manifestFile.entries.push({
    recipeId: `recipe-${r.slug}`,
    servingCount: r.servings,
    ingredients: manifestIngredients,
    totals: totalsArr,
    limitations: [
      "Recipe-level values are estimates; cooking yield and moisture changes are not modeled.",
      "Water and salt are listed as exclusions and contribute nothing to the totals.",
      "Millilitre quantities are treated as grams; density is not modeled.",
    ],
  });

  reviewFile.entries.push({
    recipeId: `recipe-${r.slug}`,
    evidenceId: `review-${r.slug}`,
    role: "Aaharai AI-assisted source audit",
    reviewedAt: "2026-09-25",
    sourceChecks: [
      {
        sourceId: "src-icar-rice-foods-2015",
        check: "Citation, dish identity, regional heading, cited ingredient list, and method sequence were checked against the registered source PDF.",
      },
      {
        sourceId: "src-usda-fdc-sr-legacy-2018",
        check: "USDA FoodData Central licensing, SR Legacy release, exact FDC food descriptions, IDs, and nutrient values were checked against the official release.",
      },
    ],
    adaptations: r.adaptations,
    nutritionCalculationCheck: {
      manifestVersion: 1,
      status: "recomputed",
      checkedAt: "2026-09-25",
    },
    limitations: [
      "No community cooking test was carried out for this record, so no community-tested claim is made.",
      "Nutrition figures are recomputed estimates, not laboratory analyses of the prepared dish.",
    ],
  });

  fidelityFile.records.push({
    recipeId: `recipe-${r.slug}`,
    fidelityId: `fidelity-${r.slug}`,
    sourceIds: ["src-icar-rice-foods-2015", "src-usda-fdc-sr-legacy-2018"],
    sourceTerms: r.sourceTerms,
    adaptations: r.adaptations,
    boundary:
      "The ICAR source is cited for the dish and method facts; the public prose is independently written and no source text is reproduced.",
  });

  // ---- frontmatter ----
  const fm = [];
  fm.push("---");
  fm.push(`id: recipe-${r.slug}`);
  fm.push(`slug: ${r.slug}`);
  fm.push(`title: ${JSON.stringify(r.title)}`);
  fm.push("nativeName:");
  fm.push(`  text: ${JSON.stringify(r.nativeName.text)}`);
  fm.push(`  script: ${r.nativeName.script}`);
  fm.push("region:");
  fm.push(`  state: ${JSON.stringify(r.state)}`);
  if (r.community) fm.push(`  community: ${JSON.stringify(r.community)}`);
  fm.push("languageNote: >-");
  fm.push(`  ${r.languageNote}`);
  fm.push("occasions:");
  for (const o of r.occasions) fm.push(`  - ${o}`);
  fm.push("seasonWindow:");
  fm.push("  calendar: same-year");
  fm.push(`  startMonth: ${r.season[0]}`);
  fm.push(`  endMonth: ${r.season[1]}`);
  fm.push("ingredients:");
  for (const i of r.ingredients) {
    fm.push(`  - ingredientId: ${i.id}`);
    fm.push(`    quantity: ${i.qty}`);
    fm.push(`    unit: ${i.unit}`);
    if (i.note) fm.push(`    note: ${JSON.stringify(i.note)}`);
  }
  fm.push(`allergenIds: [${r.allergens.join(", ")}]`);
  fm.push("nutrition:");
  fm.push(`  servingLabel: 1 serving (1/${r.servings} of the prepared recipe)`);
  fm.push("  values:");
  for (const t of totalsArr) {
    fm.push(`    - nutrient: ${t.nutrient}`);
    fm.push(`      amount: ${t.amount}`);
    fm.push(`      unit: ${t.unit}`);
    fm.push("      sourceId: src-usda-fdc-sr-legacy-2018");
    fm.push("      estimated: true");
  }
  fm.push("sourceIds:");
  fm.push("  - src-icar-rice-foods-2015");
  fm.push("  - src-usda-fdc-sr-legacy-2018");
  fm.push("provenance:");
  fm.push("  claim: source-cited");
  fm.push("verification:");
  fm.push("    tier: source-cited");
  fm.push("    verifierName: Aaharai AI-assisted source audit");
  fm.push("    verifiedAt: '2026-09-25'");
  fm.push("trustLabel: source-cited");
  fm.push(`totalTimeMinutes: ${r.totalTimeMinutes}`);
  fm.push(`difficulty: ${r.difficulty}`);
  fm.push("substitutionIds: []");
  fm.push(`costTier: ${r.costTier}`);
  fm.push("dietaryTags:");
  for (const d of r.dietaryTags) fm.push(`  - ${d}`);
  fm.push("seasonTags:");
  fm.push("  - year-round");
  fm.push("  - all-season");
  fm.push("steps:");
  for (const s of r.steps) {
    fm.push(`  - text: ${JSON.stringify(s.text)}`);
    if (s.technique) fm.push(`    technique: ${s.technique}`);
  }
  fm.push(`servings: ${r.servings}`);
  if (r.variations.length) {
    fm.push("variations:");
    for (const v of r.variations) {
      fm.push(`  - label: ${JSON.stringify(v.label)}`);
      fm.push(`    note: ${JSON.stringify(v.note)}`);
    }
  } else {
    fm.push("variations: []");
  }
  fm.push(`mealCategory: ${r.mealCategory}`);
  fm.push("nutritionManifestVersion: 1");
  fm.push(`reviewEvidenceId: review-${r.slug}`);
  fm.push(`sourceFidelityId: fidelity-${r.slug}`);
  fm.push("authenticityNotes: >-");
  fm.push(`  ${r.authenticity}`);
  fm.push("---");

  const body = [
    "",
    `The published source records ${r.title} under a ${r.state} heading, with the ingredient list and method order reproduced above.`,
    "",
    "Nutrition is an estimate computed from USDA FoodData Central SR Legacy values for the listed ingredients using the published calculation method. Water and salt are excluded, millilitre quantities are treated as grams, and cooking yield and frying absorption are not modeled.",
    "",
  ].join("\n");

  writeFileSync(`${root}/content/recipes/${r.slug}.mdx`, fm.join("\n") + "\n" + body);
  console.log(`${r.slug.padEnd(18)} servings=${r.servings}  ${totalsArr.map((t) => `${t.nutrient} ${t.amount}${t.unit}`).join("  ")}`);
}

write("content/foods/ingredients.json", ingredientsFile);
write("content/nutrition/manifest.json", manifestFile);
write("content/reviews/review-evidence.json", reviewFile);
write("content/source-fidelity.json", fidelityFile);
console.log("\ningredents:", ingredientsFile.ingredients.length, "| manifest:", manifestFile.entries.length, "| reviews:", reviewFile.entries.length, "| fidelity:", fidelityFile.records.length);
