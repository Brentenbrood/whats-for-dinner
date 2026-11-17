import { readFileSync } from "node:fs";
import { RECIPES } from "./data/recipes.js";

const ingredients = JSON.parse(
  readFileSync(new URL("../shared/ingredients.json", import.meta.url), "utf8")
);
const stores = JSON.parse(
  readFileSync(new URL("../shared/stores.json", import.meta.url), "utf8")
);

const ingredientById = new Map(ingredients.map((item) => [item.id, item]));
const storeById = new Map(stores.map((item) => [item.id, item]));
const validCategories = new Set(ingredients.map((item) => item.category));

export const CATALOG = {
  stores,
  ingredients,
  recipes: RECIPES
};

function round(value) {
  return Math.round(value * 100) / 100;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const PREPARED_PATTERN =
  /(knorr|wereldgerecht|trattoria|maaltijd|maaltijdmix|stamppot|hutspot|poke bowl|kant-en-klaar|uit de keuken van|kip.{0,12}burger|chicken burger|schnitzel|meatball|balletjes|soep|snack|chips|koek|taart|donut|kruidnoten|pepernoten|chocolade|snoep|roomijs|drinkyoghurt|ontbijt|muesli|piccolinis|rondo|pindakaas|gerookt|gebraden|borrelkaas|burger|wings|nugget|twister|rolletjes|tapas|appelflap|appelflappen|bollebof|slagroom|pepermunt|worst|gemengd gehakt|hert)/i;

function dealQuality(deal) {
  const discount = Math.min(deal.discountPercent ?? 0, 90);
  const priceBonus =
    deal.price === null || deal.price === undefined
      ? 0
      : Math.max(0, 8 - deal.price);
  return discount * 1.5 + priceBonus;
}

function recipeDealQuality(deal) {
  let quality = dealQuality(deal);
  if (PREPARED_PATTERN.test(deal.name)) quality -= 55;
  if (deal.price === null || deal.price === undefined) quality -= 5;
  return quality;
}

export function decorateDeal(deal) {
  const store = storeById.get(deal.store);
  return {
    ...deal,
    storeName: store?.name ?? deal.store,
    storeShort: store?.short ?? deal.store.toUpperCase(),
    storeColor: store?.color ?? "#5b5b5b",
    storeInk: store?.ink ?? "#ffffff",
    storeDealsUrl: store?.dealsUrl ?? null
  };
}

export function buildDealIndex(deals) {
  const byTag = new Map();
  for (const deal of deals) {
    if (!deal || !deal.isFood) continue;
    for (const tag of deal.tags || []) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(deal);
    }
  }
  for (const list of byTag.values()) {
    list.sort((a, b) => {
      const quality = dealQuality(b) - dealQuality(a);
      if (quality !== 0) return quality;
      return (a.price ?? 999) - (b.price ?? 999);
    });
  }
  return byTag;
}

export function normalizeGame(input = {}) {
  const counts = {};
  const rawCounts = input.counts && typeof input.counts === "object" ? input.counts : {};
  for (const [id, amount] of Object.entries(rawCounts)) {
    if (!ingredientById.has(id)) continue;
    const count = Math.max(0, Math.min(9, Math.floor(Number(amount) || 0)));
    if (count > 0) counts[id] = count;
  }

  const categoryCounts = {};
  for (const [id, count] of Object.entries(counts)) {
    const category = ingredientById.get(id)?.category;
    if (!category) continue;
    categoryCounts[category] = (categoryCounts[category] || 0) + count;
  }

  let topCategory = null;
  if (validCategories.has(input.topCategory)) {
    topCategory = input.topCategory;
  } else {
    topCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }

  const golden = ingredientById.has(input.golden) ? input.golden : null;
  const caughtIds = Object.keys(counts);
  const caught = caughtIds
    .map((id) => {
      const item = ingredientById.get(id);
      return {
        id,
        label: item.label,
        emoji: item.emoji,
        category: item.category,
        count: counts[id]
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const score = caught.reduce((total, item) => total + item.count, 0);

  return {
    counts,
    categoryCounts,
    topCategory,
    golden,
    goldenInfo: golden
      ? {
          id: golden,
          label: ingredientById.get(golden).label,
          emoji: ingredientById.get(golden).emoji,
          category: ingredientById.get(golden).category
        }
      : null,
    caught,
    score,
    caughtIds
  };
}

function chooseDeal(dealIndex, ingredient) {
  const options = dealIndex.get(ingredient.id);
  if (!options?.length) return null;
  let best = options[0];
  let bestQuality = -Infinity;
  for (const deal of options) {
    const quality = recipeDealQuality(deal);
    if (quality > bestQuality) {
      best = deal;
      bestQuality = quality;
    }
  }
  return best;
}

function scoreRecipe(recipe, dealIndex, game) {
  const onSale = [];
  const caught = [];
  let cost = 0;
  let savings = 0;
  let score = 0;

  for (const ingredient of recipe.ingredients) {
    const deal = chooseDeal(dealIndex, ingredient);
    const caughtCount = game.counts[ingredient.id] || 0;

    if (deal) {
      onSale.push({ ingredient, deal });
      score += 40 + Math.min(deal.discountPercent ?? 0, 80) * 1.1;
      if (ingredient.essential) score += 15;
      if (deal.price !== null && deal.price !== undefined) {
        score += Math.max(0, 8 - deal.price);
        cost += deal.price;
      } else {
        cost += ingredient.price ?? 0;
      }
      if (deal.originalPrice && deal.price && deal.originalPrice > deal.price) {
        savings += deal.originalPrice - deal.price;
      } else if (deal.discountPercent && ingredient.price) {
        savings += ingredient.price * (Math.min(deal.discountPercent, 80) / 100);
      }
    } else {
      cost += ingredient.price ?? 0;
    }

    if (caughtCount > 0) {
      caught.push({ ingredient, count: caughtCount });
      score += 30 + Math.min(caughtCount, 4) * 12;
      if (ingredient.essential) score += 8;
    }

    if (game.topCategory && ingredientById.get(ingredient.id)?.category === game.topCategory) {
      score += 7;
    }
  }

  const size = recipe.ingredients.length || 1;
  score += (onSale.length / size) * 30;
  const caughtUnits = caught.reduce((total, entry) => total + entry.count, 0);
  const totalUnits = Object.values(game.counts).reduce(
    (total, count) => total + count,
    0
  );
  if (totalUnits > 0) {
    score += (caughtUnits / totalUnits) * 250;
  }
  const goldenCaught = game.golden ? game.counts[game.golden] || 0 : 0;
  if (
    goldenCaught > 0 &&
    recipe.ingredients.some((item) => item.id === game.golden)
  ) {
    score += 55;
  }

  score += hashString(
    `${recipe.id}:${Object.entries(game.counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, count]) => `${id}${count}`)
      .join("")}`
  ) % 11;

  return {
    onSale,
    caught,
    cost: round(cost),
    savings: round(savings),
    score: Math.round(score)
  };
}

function serializeDeal(deal) {
  return {
    id: deal.id,
    name: deal.name,
    brand: deal.brand,
    price: deal.price,
    originalPrice: deal.originalPrice,
    discountLabel: deal.discountLabel,
    discountPercent: deal.discountPercent,
    unit: deal.unit,
    image: deal.image,
    url: deal.url,
    store: deal.store,
    storeName: storeById.get(deal.store)?.name ?? deal.store,
    storeShort: storeById.get(deal.store)?.short ?? deal.store.toUpperCase(),
    storeColor: storeById.get(deal.store)?.color ?? "#5b5b5b",
    storeInk: storeById.get(deal.store)?.ink ?? "#ffffff",
    storeDealsUrl: storeById.get(deal.store)?.dealsUrl ?? null
  };
}

function buildReason(recipe) {
  const storeNames = [
    ...new Set(
      recipe.onSale.map(
        (entry) => storeById.get(entry.deal.store)?.name ?? entry.deal.store
      )
    )
  ];
  const dealNames = recipe.onSale
    .slice(0, 3)
    .map((entry) => entry.ingredient.name.toLowerCase());

  if (recipe.onSale.length > 0) {
    const storeLabel =
      storeNames.length === 1
        ? storeNames[0]
        : `${storeNames.slice(0, -1).join(", ")} and ${storeNames.at(-1)}`;
    const caughtPart =
      recipe.caught.length > 0
        ? ` You also caught ${recipe.caught.length} of its ingredients in the game.`
        : "";
    return `${recipe.onSale.length} ingredient${
      recipe.onSale.length === 1 ? " is" : "s are"
    } on sale at ${storeLabel} right now — including ${dealNames.join(", ")}.${caughtPart}`;
  }

  if (recipe.caught.length > 0) {
    return `You caught ${recipe.caught.length} of its ingredients, so tonight's shopping list is already partly covered.`;
  }

  return "A reliable pick from the recipe bank when the deals don't quite line up.";
}

function serializeRecipe(recipe, scoreData, game) {
  const onSaleIds = new Set(scoreData.onSale.map((entry) => entry.ingredient.id));
  const caughtIds = new Set(scoreData.caught.map((entry) => entry.ingredient.id));

  const serialized = {
    id: recipe.id,
    title: recipe.title,
    subtitle: recipe.subtitle,
    emoji: recipe.emoji,
    minutes: recipe.minutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    mainProtein: recipe.mainProtein,
    vibe: recipe.vibe,
    tags: recipe.tags,
    steps: recipe.steps,
    tip: recipe.tip,
    ingredients: recipe.ingredients.map((ingredient) => {
      const entry = scoreData.onSale.find(
        (candidate) => candidate.ingredient.id === ingredient.id
      );
      return {
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredient.amount,
        price: ingredient.price,
        essential: Boolean(ingredient.essential),
        onSale: Boolean(entry),
        caught: caughtIds.has(ingredient.id),
        caughtCount: game.counts[ingredient.id] || 0,
        deal: entry ? serializeDeal(entry.deal) : null
      };
    }),
    onSaleCount: scoreData.onSale.length,
    caughtCount: scoreData.caught.length,
    cost: scoreData.cost,
    savings: scoreData.savings,
    score: scoreData.score,
    reason: buildReason(scoreData),
    goldenMatch: Boolean(
      game.golden &&
        (game.counts[game.golden] || 0) > 0 &&
        recipe.ingredients.some((item) => item.id === game.golden)
    )
  };

  return serialized;
}

export function recommend({ deals, game: gameInput, storeIds = [], limit = 4 }) {
  const allowedStores = new Set(
    storeIds.filter((id) => storeById.has(id))
  );
  const filteredDeals =
    allowedStores.size === 0
      ? deals
      : deals.filter((deal) => allowedStores.has(deal.store));
  const dealIndex = buildDealIndex(filteredDeals);
  const game = normalizeGame(gameInput);

  const ranked = RECIPES.map((recipe) => {
    const scoreData = scoreRecipe(recipe, dealIndex, game);
    return {
      recipe,
      scoreData
    };
  }).sort((a, b) => b.scoreData.score - a.scoreData.score);

  const picked = [];
  const proteins = new Set();

  for (const entry of ranked) {
    if (picked.length >= limit) break;
    if (proteins.has(entry.recipe.mainProtein)) continue;
    picked.push(entry);
    proteins.add(entry.recipe.mainProtein);
  }
  for (const entry of ranked) {
    if (picked.length >= limit) break;
    if (picked.some((candidate) => candidate.recipe.id === entry.recipe.id)) continue;
    picked.push(entry);
  }

  const recipes = picked.map((entry) =>
    serializeRecipe(entry.recipe, entry.scoreData, game)
  );

  return {
    primary: recipes[0] ?? null,
    alternatives: recipes.slice(1),
    recipes,
    game,
    matchedStores: stores
      .filter((store) => allowedStores.size === 0 || allowedStores.has(store.id))
      .map((store) => ({
        ...store,
        deals: filteredDeals.filter((deal) => deal.store === store.id).length,
        foodDeals: filteredDeals.filter(
          (deal) => deal.store === store.id && deal.isFood
        ).length
      }))
  };
}

export function summarizeDeals(deals, storeIds = []) {
  const allowedStores = new Set(storeIds.filter((id) => storeById.has(id)));
  const filtered =
    allowedStores.size === 0
      ? deals
      : deals.filter((deal) => allowedStores.has(deal.store));
  return filtered;
}

export function metaForStores(deals, summary = {}) {
  return stores.map((store) => {
    const storeDeals = deals.filter((deal) => deal.store === store.id);
    const foodDeals = storeDeals.filter((deal) => deal.isFood);
    const status = summary[store.id] ?? {};
    return {
      ...store,
      totalDeals: storeDeals.length,
      foodDeals: foodDeals.length,
      status: status.status ?? (storeDeals.length ? "ok" : "empty"),
      message: status.message ?? null
    };
  });
}
