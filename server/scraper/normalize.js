import { readFileSync } from "node:fs";
import { cleanText, parsePromotionLabel, stableId } from "./util.js";

const ingredients = JSON.parse(
  readFileSync(new URL("../../shared/ingredients.json", import.meta.url), "utf8")
);

function fold(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const keywordIndex = ingredients
  .flatMap((ingredient) =>
    ingredient.keywords.map((keyword) => ({
      id: ingredient.id,
      keyword: fold(keyword)
    }))
  )
  .sort((a, b) => b.keyword.length - a.keyword.length);

const NON_FOOD_PATTERN =
  /(huishoud|huisdier|dierenvoeding|dierenvoer|kattenvoer|hondenvoer|kattenbak|hondenbrok|purina|pedigree|whiskas|felix|sheba|royal canin|smuldier|drogisterij|mondverzorging|tandpasta|tandenborstel|tandfloss|mondspoeling|persoonlijke verzorging|shampoo|conditioner|deodorant|antiperspirant|douchegel|bodylotion|handcreme|gezichtcreme|zonnebrand|scheerschuim|scheermes|maandverband|tampon|luier|billendoekjes|toiletpapier|keukenpapier|vaatwas|wasmiddel|wasverzend|schoonmaak|allesreiniger|bleekmiddel|paracetamol|ibuprofen|pleister|vitamine|babyvoeding|peutervoeding)/i;

const TAG_BLOCKERS = {
  pasta: /(tandpasta|nootjespasta|chocoladepasta|pastasaus|pastasalade|meatball|maaltijd|uit de keuken van|knorr)/i,
  rice: /(rijstpapier|rijstwafel|rijstmelk|rijstepap|poke bowl|maaltijd|wereldgerecht|knorr)/i,
  nuts: /(kruidnoten|pepernoten)/i,
  apple: /(appelazijn|appelcider)/i,
  beef: /(kipgehakt|kalkoengehakt|varkensgehakt|vegagehakt|vegetarisch gehakt|gemengd gehakt|herten|hert|paarden|paard|gebraden)/i,
  chicken: /(worst|schnitzel|burger|wing|nugget|salade|soep|saus|maaltijd)/i,
  whitefish: /(burger|nugget|salade|soep|maaltijd)/i,
  herbs: /(pepermunt|muntsnoep|thee)/i,
  cream: /(slagroom|choco|dessert|roomijs|taart|gebak)/i,
  butter: /(appelflap|appelflappen|koek|koekjes|taart|gebak|bollebof|chocolade|chocola)/i,
  bread: /(suikerbrood|rozijnen|krenten|scrocchi|picos|borreltoast|crackers|beschuit)/i,
  beans: /(koffiebonen|chocoladebonen|cacaobonen)/i,
  sausage: /(leverworst|paté|broodje|pastei)/i,
  curry: /(curryworst|curryworsten)/i,
  tomato: /(witte bonen in tomatensaus|tomatensoep|ketchup|chips|pizza)/i,
  tomato_sauce: /(witte bonen in tomatensaus|tomatensoep|pastasalade)/i,
  tortilla: /(tortilla chips|nacho chips|chips|knorr wereldgerecht|maaltijdmix|taco mix|taco kruiden)/i
};

const PREPARED_PATTERN =
  /(knorr (wereldgerecht|trattoria)|wereldgerecht|trattoria|maaltijd|maaltijdmix|stamppot|hutspot|poke bowl|kant-en-klaar|uit de keuken van|chicken tonight|asia tonight|roerbaksaus|kip.{0,15}burger|chicken burger|schnitzel|cordon bleu|meatball|balletjes|soep|salade|snack|chips|koek|taart|donut|gebak|koffiebroodje|worstenbroodje|rozijnenbollen|kruier|kruidenthee|thee|pindakaas|chocolonely|chocolade|chocola|roomijs|drinkyoghurt|yoghurtvariatie|variatie op kwark|ontbijt|muesli|piccolinis|rondo|iglo|fish cuisine|spring rolls|pureersoep|tomatensoep|ketchup|borrelkaas|burger|wings|nugget|twister|rolletjes|tapas|appelflap|appelflappen|bollebof|slagroom|pepermunt|muntsnoep)/i;

const KEEP_ON_PREPARED = new Set(["chocolate", "snacks", "coffee", "wine"]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchIngredientTags(text) {
  const haystack = fold(text);
  if (!haystack) return [];
  const tags = new Set();
  const appleWords = new Set(["appel", "appels", "appeltjes"]);
  for (const { id, keyword } of keywordIndex) {
    if (!keyword) continue;
    if (appleWords.has(keyword)) {
      if (new RegExp(`(?<!aard)(?<!sinaas)${escapeRegExp(keyword)}`).test(haystack)) {
        tags.add(id);
      }
    } else if (keyword.length <= 3) {
      const pattern = new RegExp(
        `(^|[^a-z0-9])${escapeRegExp(keyword)}([^a-z0-9]|$)`
      );
      if (pattern.test(haystack)) tags.add(id);
    } else if (haystack.includes(keyword)) {
      tags.add(id);
    }
  }
  for (const [id, pattern] of Object.entries(TAG_BLOCKERS)) {
    if (tags.has(id) && pattern.test(haystack)) tags.delete(id);
  }
  if (PREPARED_PATTERN.test(haystack)) {
    for (const id of [...tags]) {
      if (!KEEP_ON_PREPARED.has(id)) tags.delete(id);
    }
  }
  return [...tags];
}

function isNonFoodProduct(name, brand, category) {
  const haystack = fold([name, brand, category].filter(Boolean).join(" "));
  return NON_FOOD_PATTERN.test(haystack);
}

export function normalizeDeal(store, input) {
  const name = cleanText(input.name);
  if (!name) return null;
  const brand = cleanText(input.brand);
  const category = cleanText(input.category);
  const discountLabel = cleanText(input.discountLabel);
  const promotion = parsePromotionLabel(discountLabel);
  const price =
    typeof input.price === "number" && Number.isFinite(input.price)
      ? Math.round(input.price * 100) / 100
      : null;
  const originalPrice =
    typeof input.originalPrice === "number" && Number.isFinite(input.originalPrice)
      ? Math.round(input.originalPrice * 100) / 100
      : null;

  let effectivePrice = price;
  if (promotion?.unitPrice) {
    effectivePrice =
      effectivePrice && effectivePrice < promotion.unitPrice
        ? effectivePrice
        : promotion.unitPrice;
  }

  let discountPercent = null;
  if (originalPrice && effectivePrice && originalPrice > effectivePrice) {
    discountPercent = Math.round(
      (1 - effectivePrice / originalPrice) * 100
    );
  } else if (promotion?.discountPercent) {
    discountPercent = promotion.discountPercent;
  }

  const nonFood = isNonFoodProduct(name, brand, category);
  const tags = nonFood
    ? []
    : matchIngredientTags([name, brand, discountLabel].filter(Boolean).join(" "));

  return {
    id: `${store}:${input.externalId || stableId(store, name, input.url)}`,
    store,
    name,
    brand: brand || null,
    price: effectivePrice ?? null,
    shelfPrice: price,
    originalPrice,
    unit: cleanText(input.unit) || null,
    discountLabel: discountLabel || (discountPercent ? `${discountPercent}% korting` : null),
    discountPercent,
    image: input.image || null,
    url: input.url || null,
    category: category || null,
    validFrom: input.validFrom || null,
    validUntil: input.validUntil || null,
    tags,
    isFood: tags.length > 0
  };
}

export function dedupeDeals(deals) {
  const seen = new Set();
  const output = [];
  for (const deal of deals) {
    if (!deal) continue;
    const key = deal.url || `${deal.store}:${deal.name}:${deal.price}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(deal);
  }
  return output;
}

export { ingredients };
