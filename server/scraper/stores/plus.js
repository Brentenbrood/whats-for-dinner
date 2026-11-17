import * as cheerio from "cheerio";
import { cleanText, parsePrice } from "../util.js";
import { dedupeDeals, normalizeDeal } from "../normalize.js";
import { renderDom } from "../browser.js";

const MONTHS = {
  jan: 0,
  feb: 1,
  mrt: 2,
  apr: 3,
  mei: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  okt: 9,
  nov: 10,
  dec: 11
};

function parseDutchDate(text) {
  const match = String(text).match(/t\/m\s+(\d{1,2})\s+([a-z]{3})/i);
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  if (!Number.isFinite(month)) return null;
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(Date.UTC(year, month, day));
  if (candidate.getTime() - now.getTime() > 200 * 24 * 3600 * 1000) {
    year -= 1;
  }
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function currentPrice(root, $) {
  const integer = root
    .find(".product-header-price-integer")
    .first()
    .text()
    .replace(/[^\d]/g, "");
  const decimals = root
    .find(".product-header-price-decimals")
    .first()
    .text()
    .replace(/[^\d]/g, "");
  if (!integer) {
    return parsePrice(root.find(".plp-item-price").first().text());
  }
  return Number(`${integer}.${decimals || "00"}`);
}

function promotionText(root, $) {
  const candidates = root
    .find(
      '.plp-item-complementary-top, [class*="promotion"], [class*="Promotion"], [class*="label"], [class*="Label"], [class*="badge"], [class*="Badge"]'
    )
    .map((_, element) => cleanText($(element).text()))
    .get()
    .filter(Boolean);

  for (const text of candidates) {
    const match = text.match(
      /(\d+\s*voor\s*€?\s*[\d.,]+|\d+\s*%\s*korting|1\s*\+\s*1\s*gratis|2e\s*gratis)/i
    );
    if (match) return cleanText(match[1]);
  }
  return "";
}

export async function scrapePlus() {
  const html = await renderDom("https://www.plus.nl/aanbiedingen");
  const $ = cheerio.load(html);
  const deals = [];

  $(".plp-item-price").each((_, element) => {
    const priceElement = $(element);
    let root = priceElement.closest('a[href*="/product/"]');
    if (!root.length) root = priceElement.closest(".plp-item-wrapper");
    if (!root.length) root = priceElement.closest("li");
    if (!root.length) return;

    const link = root.is("a")
      ? root
      : root.find('a[href*="/product/"]').first();
    const name = cleanText(
      root.find(".plp-item-name").first().text() ||
        link.attr("title") ||
        link.attr("aria-label")
    );
    const price = currentPrice(root, $);
    if (!name || !price) return;

    const previous = parsePrice(
      root.find(".product-header-price-previous").first().text()
    );
    const unitElement = root
      .find(".plp-item-complementary .multiline-truncation-text-1")
      .first();
    const unit = cleanText(unitElement.text());
    const promo = promotionText(root, $);

    deals.push(
      normalizeDeal("plus", {
        externalId: link.attr("href"),
        name,
        price,
        originalPrice: previous && previous > price ? previous : null,
        discountLabel: promo || "Weekdeal",
        unit:
          unit ||
          cleanText(
            root
              .find(".plp-item-complementary")
              .first()
              .text()
              .split("t/m")[0]
          ),
        image: root.find("img").first().attr("src"),
        url: link.attr("href")
          ? new URL(link.attr("href"), "https://www.plus.nl").toString()
          : null,
        validUntil: parseDutchDate(root.text())
      })
    );
  });

  const unique = dedupeDeals(deals);
  if (!unique.length) throw new Error("PLUS products not found in rendered page");
  return unique;
}
