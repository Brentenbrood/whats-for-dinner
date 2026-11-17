import * as cheerio from "cheerio";
import { fetchText, absolute, cleanText, parsePrice } from "../util.js";
import { dedupeDeals, normalizeDeal } from "../normalize.js";

export async function scrapeAh() {
  const html = await fetchText("https://www.ah.nl/bonus", { timeout: 45000 });
  const $ = cheerio.load(html);
  const deals = [];

  $('[data-testid="product-card-current-price"]').each((_, element) => {
    const priceElement = $(element);
    let card = priceElement.closest(
      '[data-testid="product-card-horizontal-container"]'
    );
    if (!card.length) {
      card = priceElement
        .parents()
        .filter(
          (_, node) =>
            $(node).find('[data-testid="product-card-text-container"]').length >
              0 && $(node).find("a[href]").length > 0
        )
        .first();
    }
    if (!card.length) return;

    const name = cleanText(
      card.find(".HkpQGW_title").first().text() ||
        card.find('[data-testid="product-card-text-container"] p').first().text()
    );
    const price = parsePrice(priceElement.text());
    if (!name || !price) return;

    const originalElement = card
      .find('[data-testid="product-card-original-price"]')
      .first();
    const originalPrice =
      parsePrice(originalElement.text()) ||
      parsePrice(originalElement.attr("aria-label"));

    const promoElement = card
      .find('[data-testid="product-card-promotion-label"]')
      .first();
    const discountLabel = cleanText(
      promoElement.attr("aria-label") || promoElement.text()
    );

    const href = card.find("a[href]").first().attr("href");
    const image = card.find("img").first().attr("src");

    deals.push(
      normalizeDeal("ah", {
        externalId: href,
        name,
        price,
        originalPrice,
        discountLabel,
        unit: cleanText(
          card.find('[data-testid="product-card-price-description"]').first().text()
        ),
        image: image ? image.replace(/&amp;/g, "&") : null,
        url: absolute("https://www.ah.nl", href)
      })
    );
  });

  const pricedNames = deals.map((deal) => deal.name.toLowerCase());

  $('[data-testid="segment-card-container"]').each((_, element) => {
    const card = $(element);
    if (card.find('[data-testid="product-card-price"]').length) return;

    const link = card.find("a[href]").first();
    const name = cleanText(
      card.find('[data-testid="product-card-text-container"] p').first().text() ||
        card.find("p").first().text()
    );
    const href = link.attr("href");
    if (!name || !href) return;
    const normalizedName = name.toLowerCase();
    if (
      pricedNames.some(
        (priced) =>
          priced.includes(normalizedName) || normalizedName.includes(priced)
      )
    ) {
      return;
    }

    const promoElement = card
      .find('[data-testid="product-card-promotion-label"]')
      .first();
    const discountLabel = cleanText(
      promoElement.attr("aria-label") ||
        promoElement.text() ||
        link.attr("aria-label")
    );
    const image = card.find("img").first().attr("src");

    deals.push(
      normalizeDeal("ah", {
        externalId: href,
        name,
        discountLabel,
        image: image ? image.replace(/&amp;/g, "&") : null,
        url: absolute("https://www.ah.nl", href)
      })
    );
  });

  return dedupeDeals(deals);
}
