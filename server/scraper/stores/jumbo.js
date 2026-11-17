import { unflatten } from "devalue";
import { fetchText, absolute, cleanText, parsePromotionLabel } from "../util.js";
import { dedupeDeals, normalizeDeal } from "../normalize.js";

const revivers = {
  ShallowReactive: (value) => value,
  Reactive: (value) => value,
  Ref: (value) => value,
  ShallowRef: (value) => value,
  EmptyShallowRef: (value) => value,
  EmptyRef: (value) => value,
  NuxtError: (value) => value,
  Date: (value) => value,
  Set: (value) => value,
  Map: (value) => value,
  BigInt: (value) => value,
  RegExp: (value) => value,
  URL: (value) => value,
  URLSearchParams: (value) => value,
  Object: (value) => value,
  Error: (value) => value
};

function priceFromLabel(label) {
  const parsed = parsePromotionLabel(label);
  if (!parsed) return null;
  if (parsed.unitPrice) return parsed.unitPrice;
  if (parsed.total && parsed.quantity) {
    return Math.round((parsed.total / parsed.quantity) * 100) / 100;
  }
  return null;
}

export async function scrapeJumbo() {
  const html = await fetchText("https://www.jumbo.com/aanbiedingen", {
    timeout: 45000
  });
  const match = html.match(
    /<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) throw new Error("Jumbo payload not found");

  const data = unflatten(JSON.parse(match[1]), revivers);
  const runtimes = data?.data?.nuTab?.activeTab?.runtimes || [];
  const seen = new Set();
  const deals = [];

  for (const runtime of runtimes) {
    for (const section of runtime.sections || []) {
      for (const promotion of section.promotions || []) {
        if (!promotion?.id || seen.has(promotion.id)) continue;
        seen.add(promotion.id);
        const title = cleanText(promotion.title);
        if (!title) continue;
        const labels = (promotion.tags || [])
          .map((tag) => cleanText(tag.text))
          .filter(Boolean);
        const discountLabel =
          labels.find((label) =>
            /(%|korting|gratis|voor\s|1\s*\+|2e\s*gratis)/i.test(label)
          ) ||
          labels[0] ||
          "";
        const price = priceFromLabel(discountLabel);

        deals.push(
          normalizeDeal("jumbo", {
            externalId: promotion.id,
            name: title,
            price,
            discountLabel,
            image: promotion.image,
            url: absolute("https://www.jumbo.com", promotion.url),
            category: cleanText(promotion.group) || null,
            validFrom: promotion.start?.iso?.slice(0, 10),
            validUntil: promotion.end?.iso?.slice(0, 10)
          })
        );
      }
    }
  }

  return dedupeDeals(deals.filter((deal) => deal?.isFood));
}
