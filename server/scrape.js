import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeAh } from "./scraper/stores/ah.js";
import { scrapeDirk } from "./scraper/stores/dirk.js";
import { scrapeJumbo } from "./scraper/stores/jumbo.js";
import { scrapePlus } from "./scraper/stores/plus.js";
import { scrapeLidl } from "./scraper/stores/lidl.js";
import { scrapeAldi } from "./scraper/stores/aldi.js";

const stores = JSON.parse(
  readFileSync(new URL("../shared/stores.json", import.meta.url), "utf8")
);

const adapters = {
  ah: scrapeAh,
  dirk: scrapeDirk,
  jumbo: scrapeJumbo,
  plus: scrapePlus,
  lidl: scrapeLidl,
  aldi: scrapeAldi
};

const dataPath = new URL("../data/deals.json", import.meta.url);
const dataFile = fileURLToPath(dataPath);

function loadPrevious() {
  if (!existsSync(dataFile)) return null;
  try {
    return JSON.parse(readFileSync(dataFile, "utf8"));
  } catch {
    return null;
  }
}

function sortDeals(deals) {
  return [...deals].sort((a, b) => {
    if (a.isFood !== b.isFood) return a.isFood ? -1 : 1;
    const discountA = a.discountPercent ?? 0;
    const discountB = b.discountPercent ?? 0;
    if (discountA !== discountB) return discountB - discountA;
    return (a.price ?? 999) - (b.price ?? 999);
  });
}

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.split("=")[1].split(",")) : null;
const previous = loadPrevious();
const results = {};

const tasks = stores
  .filter((store) => !only || only.has(store.id))
  .map(async (store) => {
    const started = Date.now();
    try {
      const deals = await adapters[store.id]();
      results[store.id] = {
        status: "live",
        deals: sortDeals(deals),
        error: null,
        fetchedAt: new Date().toISOString(),
        durationMs: Date.now() - started
      };
      console.log(
        `✓ ${store.name.padEnd(14)} ${String(deals.length).padStart(3)} deals (${Date.now() - started}ms)`
      );
    } catch (error) {
      const fallback = previous?.stores?.[store.id];
      results[store.id] = {
        status: fallback?.deals?.length ? "stale" : "unavailable",
        deals: fallback?.deals || [],
        error: error.message,
        fetchedAt: fallback?.fetchedAt || null,
        durationMs: Date.now() - started
      };
      console.log(`✗ ${store.name.padEnd(14)} ${error.message}`);
    }
  });

await Promise.all(tasks);

for (const store of stores) {
  if (only && !only.has(store.id)) {
    const keep = previous?.stores?.[store.id];
    if (keep) results[store.id] = keep;
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  stores: {}
};

for (const store of stores) {
  const result = results[store.id];
  if (!result) continue;
  payload.stores[store.id] = {
    id: store.id,
    name: store.name,
    status: result.status,
    fetchedAt: result.fetchedAt,
    durationMs: result.durationMs ?? null,
    error: result.error ?? null,
    count: result.deals.length,
    foodCount: result.deals.filter((deal) => deal.isFood).length,
    deals: result.deals
  };
}

mkdirSync(dirname(dataFile), { recursive: true });
writeFileSync(dataFile, `${JSON.stringify(payload, null, 2)}\n`);

const total = Object.values(payload.stores).reduce(
  (sum, store) => sum + store.deals.length,
  0
);
const food = Object.values(payload.stores).reduce(
  (sum, store) => sum + store.foodCount,
  0
);
console.log(`\nSaved ${total} deals (${food} food) to data/deals.json`);
