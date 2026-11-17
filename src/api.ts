import type { DealsResponse, GamePayload, Meta, RecipeResponse } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function fetchMeta(): Promise<Meta> {
  return request<Meta>("/api/meta");
}

export function fetchDeals(stores: string[]): Promise<DealsResponse> {
  const query = new URLSearchParams();
  if (stores.length) query.set("stores", stores.join(","));
  query.set("limit", "600");
  return request<DealsResponse>(`/api/deals?${query.toString()}`);
}

export function fetchRecipe(
  stores: string[],
  game: GamePayload
): Promise<RecipeResponse> {
  return request<RecipeResponse>("/api/recipe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ stores, game })
  });
}
