import express from "express";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  CATALOG,
  decorateDeal,
  metaForStores,
  recommend,
  summarizeDeals
} from "./engine.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dealsPath = path.join(root, "data", "deals.json");
const distPath = path.join(root, "dist");
const port = Number(process.env.PORT || 8787);

function loadDealFile() {
  if (!existsSync(dealsPath)) {
    throw new Error(
      "data/deals.json is missing. Run `npm run scrape` before starting the server."
    );
  }
  const payload = JSON.parse(readFileSync(dealsPath, "utf8"));
  const deals = [];
  const summary = {};
  for (const [storeId, store] of Object.entries(payload.stores || {})) {
    if (!store) continue;
    summary[storeId] = {
      status: store.status,
      message: store.error ?? null,
      fetchedAt: store.fetchedAt ?? null,
      durationMs: store.durationMs ?? null
    };
    for (const deal of store.deals || []) {
      if (deal) deals.push(deal);
    }
  }
  return {
    generatedAt: payload.generatedAt ?? null,
    deals,
    summary
  };
}

const snapshot = loadDealFile();
const app = express();

app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.disable("x-powered-by");
app.use(express.json({ limit: "96kb" }));

function requestedStores(value) {
  if (Array.isArray(value)) {
    return value
      .filter((id) => typeof id === "string")
      .filter((id) => CATALOG.stores.some((store) => store.id === id))
      .slice(0, 20);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .filter((id) => CATALOG.stores.some((store) => store.id === id))
      .slice(0, 20);
  }
  return [];
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    generatedAt: snapshot.generatedAt,
    deals: snapshot.deals.length
  });
});

app.get("/api/meta", (_request, response) => {
  const stores = metaForStores(snapshot.deals, snapshot.summary);
  response.json({
    generatedAt: snapshot.generatedAt,
    dealCount: snapshot.deals.length,
    foodDealCount: snapshot.deals.filter((deal) => deal.isFood).length,
    recipeCount: CATALOG.recipes.length,
    gameIngredients: CATALOG.ingredients
      .filter((ingredient) => ingredient.game)
      .map(({ id, label, emoji, category }) => ({
        id,
        label,
        emoji,
        category
      })),
    stores
  });
});

app.get("/api/deals", (request, response) => {
  const storeIds = requestedStores(request.query.stores);
  const foodOnly = request.query.all !== "1";
  const limit = Math.min(
    1200,
    Math.max(1, Number(request.query.limit) || 600)
  );
  let deals = summarizeDeals(snapshot.deals, storeIds);
  if (foodOnly) deals = deals.filter((deal) => deal.isFood);
  const total = deals.length;
  const ordered = deals
    .slice()
    .sort((a, b) => {
      const discount = (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
      if (discount !== 0) return discount;
      const price = (a.price ?? 999) - (b.price ?? 999);
      if (price !== 0) return price;
      return String(a.store).localeCompare(String(b.store));
    })
    .slice(0, limit)
    .map(decorateDeal);

  response.set("Cache-Control", "public, max-age=120");
  response.json({
    generatedAt: snapshot.generatedAt,
    total,
    stores: metaForStores(snapshot.deals, snapshot.summary),
    deals: ordered
  });
});

app.post("/api/recipe", (request, response) => {
  const body = request.body && typeof request.body === "object" ? request.body : {};
  const storeIds = requestedStores(body.stores);
  const game = body.game && typeof body.game === "object" ? body.game : {};
  const result = recommend({
    deals: snapshot.deals,
    game,
    storeIds,
    limit: 4
  });

  response.json({
    generatedAt: snapshot.generatedAt,
    ...result
  });
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Unknown API route" });
});

if (existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: "1h",
      setHeaders(response, filePath) {
        if (filePath.endsWith("index.html")) {
          response.setHeader("Cache-Control", "no-cache");
        }
      }
    })
  );
  app.get("*", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("*", (_request, response) => {
    response
      .status(200)
      .type("text/plain")
      .send(
        "API is running. Start the Vite dev server with `npm run dev`, or build the frontend with `npm run build`."
      );
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(port, () => {
  console.log(
    `What's for dinner API listening on http://localhost:${port} (${snapshot.deals.length} deals)`
  );
});
