import { createHash } from "node:crypto";

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function fetchText(url, options = {}) {
  const { timeout = 30000, headers = {}, attempts = 3 } = options;
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeout),
        headers: {
          "user-agent": UA,
          "accept-language": "nl-NL,nl;q=0.9,en;q=0.6",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          ...headers
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching ${url}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
  }
  const reason = lastError?.cause?.code || lastError?.cause?.message || "";
  throw new Error(
    `${lastError?.message || "Fetch failed"}${reason ? ` (${reason})` : ""}`
  );
}

export function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function parsePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  const text = cleanText(value);
  if (!text) return null;
  const match = text.match(/-?\d+(?:[.,]\d{1,2})?/);
  if (!match) return null;
  const number = Number(match[0].replace(",", "."));
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

export function toIsoDate(value) {
  if (!value) return null;
  if (typeof value === "number") {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000;
    return new Date(milliseconds).toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function absolute(base, value) {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

export function stableId(...parts) {
  return createHash("sha1")
    .update(parts.filter(Boolean).join("|"))
    .digest("hex")
    .slice(0, 16);
}

export function normalizeLabel(value) {
  return cleanText(value).replace(/\s+/g, " ");
}

export function parsePromotionLabel(label) {
  const text = normalizeLabel(label).toLowerCase();
  if (!text) return null;
  const percent = text.match(/(\d{1,2})\s*%\s*korting/);
  if (percent) {
    return { discountPercent: Number(percent[1]) };
  }
  const shortPercent = text.match(/^-?\s*(\d{1,2})\s*%$/);
  if (shortPercent) {
    return { discountPercent: Number(shortPercent[1]) };
  }
  if (/(1\s*\+\s*1|2e\s*gratis|tweede\s*gratis)/.test(text)) {
    return { discountPercent: 50 };
  }
  const multi = text.match(
    /(?:^|[^\d.,])(\d{1,2})\s*voor\s*€?\s*(\d+(?:[.,]\d{1,2})?)/
  );
  if (multi) {
    const quantity = Number(multi[1]);
    const total = parsePrice(multi[2]);
    if (quantity > 0 && total) {
      return {
        quantity,
        total,
        unitPrice: Math.round((total / quantity) * 100) / 100
      };
    }
  }
  const single = text.match(/voor\s*€?\s*(\d+(?:[.,]\d{1,2})?)/);
  if (single) {
    return { unitPrice: parsePrice(single[1]) };
  }
  return null;
}
