import { unflatten } from "devalue";
import { fetchText, absolute, cleanText } from "../util.js";
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

function imageUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith("artikelen/")) {
    return `https://web-fileserver.dirk.nl/${value}`;
  }
  return null;
}

export async function scrapeDirk() {
  const html = await fetchText("https://www.dirk.nl/aanbiedingen", {
    timeout: 45000
  });
  const match = html.match(
    /<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) throw new Error("Dirk payload not found");

  const data = unflatten(JSON.parse(match[1]), revivers);
  const categories = data?.data?.["offers-currentOffers"] || [];
  const deals = [];

  for (const category of categories) {
    for (const offer of category.currentOffers || []) {
      for (const product of (offer.products || []).filter(Boolean)) {
        const info = product.productInformation || {};
        const price = product.offerPrice ?? offer.offerPrice;
        const originalPrice = product.normalPrice ?? offer.normalPrice;
        const name = cleanText(info.headerText || offer.headerText);
        if (!name || typeof price !== "number") continue;

        const percent =
          originalPrice && originalPrice > price
            ? Math.round((1 - price / originalPrice) * 100)
            : null;

        deals.push(
          normalizeDeal("dirk", {
            externalId: product.productId,
            name,
            brand: info.brand,
            price,
            originalPrice,
            discountLabel: percent ? `${percent}% korting` : "Actie",
            unit: info.packaging || offer.packaging,
            image: imageUrl(info.image),
            url: `https://www.dirk.nl/zoeken?q=${encodeURIComponent(name)}`,
            category: [info.department, info.webgroup].filter(Boolean).join(" · "),
            validFrom: offer.startDate,
            validUntil: offer.endDate
          })
        );
      }
    }
  }

  return dedupeDeals(deals);
}
