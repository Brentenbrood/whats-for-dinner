export type Category =
  | "veg"
  | "protein"
  | "carb"
  | "dairy"
  | "fruit"
  | "treat"
  | "pantry";

export interface Store {
  id: string;
  name: string;
  short: string;
  color: string;
  ink: string;
  dealsUrl: string;
  totalDeals?: number;
  foodDeals: number;
  status?: string;
  message?: string | null;
}

export interface GameIngredient {
  id: string;
  label: string;
  emoji: string;
  category: Category;
}

export interface Meta {
  generatedAt: string | null;
  dealCount: number;
  foodDealCount: number;
  recipeCount: number;
  stores: Store[];
  gameIngredients: GameIngredient[];
}

export interface Deal {
  id: string;
  name: string;
  brand: string | null;
  price: number | null;
  originalPrice: number | null;
  discountLabel: string | null;
  discountPercent: number | null;
  unit: string | null;
  image: string | null;
  url: string | null;
  store: string;
  storeName: string;
  storeShort: string;
  storeColor: string;
  storeInk: string;
  storeDealsUrl: string | null;
  category?: string | null;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: string;
  price: number;
  essential: boolean;
  onSale: boolean;
  caught: boolean;
  caughtCount: number;
  deal: Deal | null;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  minutes: number;
  servings: number;
  difficulty: string;
  mainProtein: string;
  vibe: string;
  tags: string[];
  steps: string[];
  tip: string;
  ingredients: RecipeIngredient[];
  onSaleCount: number;
  caughtCount: number;
  cost: number;
  savings: number;
  score: number;
  reason: string;
  goldenMatch: boolean;
}

export interface CaughtItem {
  id: string;
  label: string;
  emoji: string;
  category: Category;
  count: number;
}

export interface GamePayload {
  counts: Record<string, number>;
  golden: string | null;
  topCategory: Category | null;
  score: number;
}

export interface GameSummary {
  counts: Record<string, number>;
  categoryCounts: Record<string, number>;
  topCategory: Category | null;
  golden: string | null;
  goldenInfo: {
    id: string;
    label: string;
    emoji: string;
    category: Category;
  } | null;
  caught: CaughtItem[];
  score: number;
  caughtIds: string[];
}

export interface GameOutcome extends GamePayload {
  caught: CaughtItem[];
}

export interface MatchedStore extends Store {
  deals: number;
}

export interface RecipeResponse {
  generatedAt: string | null;
  primary: Recipe;
  alternatives: Recipe[];
  recipes: Recipe[];
  game: GameSummary;
  matchedStores: MatchedStore[];
}

export interface DealsResponse {
  generatedAt: string | null;
  total: number;
  stores: Store[];
  deals: Deal[];
}
