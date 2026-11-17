import * as cheerio from "cheerio";
import { fetchText, absolute, cleanText, toIsoDate } from "../util.js";
import { dedupeDeals, normalizeDeal } from "../normalize.js";

function brandName(brand) {
  if (!brand) return null;
  if (typeof brand === "string") return brand;
  return brand.name || brand.title || brand.label || null;
}

function categoryName(category) {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category.title || category.name || null;
}

export async function scrapeLidl() {
  const html = await fetchText("https://www.lidl.nl/c/aanbiedingen/a10008785", {
    timeout: 45000
  });
  const $ = cheerio.load(html);
  const deals = [];

  $("[data-grid-data]").each((_, element) => {
    let data;
    try {
      data = JSON.parse($(element).attr("data-grid-data"));
    } catch {
      return;
    }
    if (!data?.title) return;

    const brand = brandName(data.brand);
    const name = cleanText(data.fullTitle || [brand, data.title].filter(Boolean).join(" "));
    const regionalPrice = data.regionsPrices?.[1]?.currentPrice;
    const price = data.price?.price ?? regionalPrice?.price ?? null;
    const imageList = data.imageList_V1 || data.imageList_V2 || [];
    const image =
      imageList?.[0]?.sizes?.mediumUrl || imageList?.[0]?.sizes?.smallUrl || null;
    const discountLabel = "Weekdeal";

    deals.push(
      normalizeDeal("lidl", {
        externalId: data.productId || data.itemId || data.erpNumber,
        name,
        brand,
        price,
        discountLabel,
        unit: data.price?.packaging?.text,
        image,
        url: absolute(
          "https://www.lidl.nl",
          data.canonicalUrl || data.canonicalPath || `/p/${data.productId}`
        ),
        category: categoryName(data.category),
        validUntil: toIsoDate(regionalPrice?.endDate || data.storeEndDate)
      })
    );
  });

  return dedupeDeals(deals);
}
