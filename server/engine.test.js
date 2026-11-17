import test from "node:test";
import assert from "node:assert/strict";
import { normalizeGame, recommend, CATALOG } from "./engine.js";
import { matchIngredientTags } from "./scraper/normalize.js";
import { parsePromotionLabel } from "./scraper/util.js";

test("normalizeGame clamps counts and drops unknown ingredients", () => {
  const game = normalizeGame({
    counts: { tomato: 12, notAnIngredient: 3 },
    topCategory: "veg",
    golden: "tomato"
  });

  assert.deepEqual(game.counts, { tomato: 9 });
  assert.equal(game.topCategory, "veg");
  assert.equal(game.golden, "tomato");
  assert.equal(game.caught[0].count, 9);
});

test("normalizeGame derives top category when none is provided", () => {
  const game = normalizeGame({ counts: { chicken: 2, rice: 1 } });

  assert.equal(game.topCategory, "protein");
});

test("recommend returns a primary recipe and respects the limit", () => {
  const result = recommend({
    deals: [],
    game: { counts: { tomato: 2 } },
    storeIds: [],
    limit: 3
  });

  assert.ok(result.primary);
  assert.equal(result.recipes.length, 3);
  assert.equal(result.recipes[0].id, result.primary.id);
});

test("recommend filters deals by selected stores", () => {
  const deals = [
    {
      id: "ah-tomato",
      store: "ah",
      name: "Tomaten",
      isFood: true,
      tags: ["tomato"],
      price: 1.29,
      discountPercent: 20
    }
  ];

  const withAh = recommend({ deals, game: {}, storeIds: ["ah"], limit: 1 });
  const withoutAh = recommend({ deals, game: {}, storeIds: ["jumbo"], limit: 1 });

  assert.equal(withAh.matchedStores.find((store) => store.id === "ah").foodDeals, 1);
  assert.equal(withoutAh.matchedStores.find((store) => store.id === "jumbo").foodDeals, 0);
});

test("matchIngredientTags matches Dutch deal text", () => {
  assert.ok(matchIngredientTags("cherry tomaat 250g").includes("tomato"));
});

test("parsePromotionLabel parses multi-buy promotions", () => {
  assert.deepEqual(parsePromotionLabel("2 voor €3.00"), {
    quantity: 2,
    total: 3,
    unitPrice: 1.5
  });
});

test("catalog contains recipes and ingredients", () => {
  assert.ok(CATALOG.recipes.length > 0);
  assert.ok(CATALOG.ingredients.length > 0);
});
