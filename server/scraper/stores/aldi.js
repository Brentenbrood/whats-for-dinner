import { fetchText, cleanText, parsePrice, toIsoDate } from "../util.js";
import { dedupeDeals, normalizeDeal } from "../normalize.js";

function collectCategories(node, map) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) collectCategories(item, map);
    return;
  }
  if (typeof node !== "object") return;
  if (Array.isArray(node.productIds) && node.title) {
    for (const id of node.productIds) {
      if (!map.has(String(id))) map.set(String(id), cleanText(node.title));
    }
  }
  for (const value of Object.values(node)) collectCategories(value, map);
}

function originalPriceFromText(text) {
  const match = String(text || "").match(/Elders\s*€?\s*(\d+(?:[.,]\d{1,2})?)/i);
  return match ? parsePrice(match[1]) : null;
}

export async function scrapeAldi() {
  const html = await fetchText("https://www.aldi.nl/aanbiedingen.html", {
    timeout: 45000
  });
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) throw new Error("ALDI payload not found");

  const nextData = JSON.parse(match[1]);
  const apiData = JSON.parse(nextData.props.pageProps.apiData);
  const offers = apiData.filter((entry) => entry[0] === "OFFER_GET");
  if (!offers.length) throw new Error("ALDI offers not found");

  const categoryMap = new Map();
  const productMap = new Map();
  for (const entry of offers) {
    const result = entry[1]?.res || {};
    collectCategories(result.categories, categoryMap);
    for (const [id, product] of Object.entries(result.algoliaDataMap || {})) {
      if (!productMap.has(id)) productMap.set(id, product);
    }
  }

  const deals = [];
  for (const [id, product] of productMap) {
    const name = cleanText(
      [product.brandName, product.name].filter(Boolean).join(" ")
    );
    const price = product.currentPrice?.priceValue;
    if (!name || typeof price !== "number") continue;

    const originalPrice =
      originalPriceFromText(product.longDescription) || null;
    const percent =
      originalPrice && originalPrice > price
        ? Math.round((1 - price / originalPrice) * 100)
        : null;
    const promoLabel = cleanText(
      product.currentPrice?.priceTagLabels?.promoText1
    );

    deals.push(
      normalizeDeal("aldi", {
        externalId: id,
        name,
        brand: product.brandName,
        price,
        originalPrice,
        discountLabel:
          percent ? `${percent}% korting` : promoLabel || "Aanbieding",
        unit:
          cleanText(product.shortDescription) ||
          cleanText(product.salesUnit) ||
          null,
        image:
          product.assets?.find((asset) => asset.type === "primary")?.url ||
          product.assets?.[0]?.url ||
          null,
        url: product.productSlug
          ? `https://www.aldi.nl/product/${product.productSlug}.html`
          : "https://www.aldi.nl/aanbiedingen.html",
        category: categoryMap.get(id) || "Aanbiedingen",
        validUntil: toIsoDate(
          product.promotionPrices?.[0]?.validUntilLocalDate ||
            product.currentPrice?.validUntil
        )
      })
    );
  }

  return dedupeDeals(deals);
}
