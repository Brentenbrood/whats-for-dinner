import { useState } from "react";
import type { CSSProperties } from "react";
import type { Recipe, RecipeResponse } from "../types";

interface ResultViewProps {
  result: RecipeResponse;
  activeIndex: number;
  onSelect: (index: number) => void;
  onNext: () => void;
  onPlayAgain: () => void;
  onChangeShops: () => void;
  onOpenDeals: () => void;
}

const THEMES: Record<string, { from: string; to: string; ink: string; soft: string }> = {
  chicken: { from: "#f8d7a4", to: "#eda66f", ink: "#4a2a0f", soft: "#fff3df" },
  beef: { from: "#f2b5a3", to: "#d96b55", ink: "#4b1c12", soft: "#fdece7" },
  fish: { from: "#b9dfe2", to: "#6fb7c0", ink: "#123c43", soft: "#e9f7f8" },
  veggie: { from: "#d9eaa8", to: "#9dc46b", ink: "#283d12", soft: "#f3f9df" },
  pork: { from: "#f6c9b7", to: "#df927b", ink: "#452018", soft: "#fdf0eb" },
  plant: { from: "#c9e8c1", to: "#86c090", ink: "#173823", soft: "#edf8ed" }
};

function themeFor(recipe: Recipe) {
  return THEMES[recipe.mainProtein] ?? THEMES.veggie;
}

function euro(value: number) {
  return `€${value.toFixed(2).replace(".", ",")}`;
}

export default function ResultView({
  result,
  activeIndex,
  onSelect,
  onNext,
  onPlayAgain,
  onChangeShops,
  onOpenDeals
}: ResultViewProps) {
  const recipe = result.recipes[activeIndex] ?? result.primary;
  const theme = themeFor(recipe);
  const [copied, setCopied] = useState(false);

  async function copyShoppingList() {
    const text = [
      recipe.title,
      ...recipe.ingredients.map((ingredient) => {
        const deal = ingredient.deal
          ? ` — ${ingredient.deal.storeShort} ${ingredient.deal.price !== null ? `€${ingredient.deal.price.toFixed(2)}` : ""}`.trim()
          : "";
        return `- ${ingredient.name} (${ingredient.amount})${deal}`;
      })
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  const caughtTotal = result.game.caught.reduce(
    (total, item) => total + item.count,
    0
  );
  const alternativeRecipes = result.recipes.filter(
    (candidate) => candidate.id !== recipe.id
  );

  return (
    <main className="result-page">
      <section
        className="recipe-hero"
        style={
          {
            "--theme-from": theme.from,
            "--theme-to": theme.to,
            "--theme-ink": theme.ink,
            "--theme-soft": theme.soft
          } as CSSProperties
        }
      >
        <div className="recipe-hero-main">
          <div className="recipe-topline">
            <span className="recipe-emoji" aria-hidden="true">
              {recipe.emoji}
            </span>
            <div className="recipe-kicker">
              <span className="vibe-pill">{recipe.vibe}</span>
              <span>{recipe.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>{recipe.minutes} min</span>
            </div>
          </div>

          <h1>{recipe.title}</h1>
          <p className="recipe-subtitle">{recipe.subtitle}</p>
          <p className="recipe-reason">
            <span aria-hidden="true">✨</span> {recipe.reason}
          </p>

          {recipe.goldenMatch && (
            <p className="golden-banner">
              <span aria-hidden="true">⭐</span> Your golden ingredient made the
              cut.
            </p>
          )}

          <div className="recipe-stats">
            <div className="stat">
              <span>Estimated cost</span>
              <strong>{euro(recipe.cost)}</strong>
              <small>for {recipe.servings}</small>
            </div>
            <div className="stat">
              <span>On sale</span>
              <strong>
                {recipe.onSaleCount}/{recipe.ingredients.length}
              </strong>
              <small>ingredients</small>
            </div>
            <div className="stat">
              <span>In your basket</span>
              <strong>{recipe.caughtCount}</strong>
              <small>of its ingredients</small>
            </div>
            <div className="stat stat-savings">
              <span>Rough saving</span>
              <strong>{recipe.savings > 0 ? euro(recipe.savings) : "—"}</strong>
              <small>vs. full price</small>
            </div>
          </div>

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={onNext}>
              Another idea
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={onOpenDeals}
            >
              Browse deals
            </button>
          </div>

          <ul className="recipe-tags" aria-label="Recipe style">
            {recipe.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        <aside className="basket-card" aria-labelledby="basket-title">
          <header>
            <div>
              <span className="eyebrow">Shopping list</span>
              <h2 id="basket-title">Tonight's basket</h2>
            </div>
            <span className="basket-total">{euro(recipe.cost)}</span>
          </header>
          <ul className="basket-list">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className={ingredient.onSale ? "is-on-sale" : ""}
              >
                <span className="basket-dot" aria-hidden="true">
                  {ingredient.onSale ? "✓" : ""}
                </span>
                <div className="basket-copy">
                  <div className="basket-name">
                    <strong>{ingredient.name}</strong>
                    <span>{ingredient.amount}</span>
                  </div>
                  {ingredient.deal ? (
                    <div className="basket-deal">
                      <span
                        className="mini-store"
                        style={{
                          background: ingredient.deal.storeColor,
                          color: ingredient.deal.storeInk
                        }}
                      >
                        {ingredient.deal.storeShort}
                      </span>
                      <span className="basket-price">
                        {ingredient.deal.price !== null
                          ? euro(ingredient.deal.price)
                          : ingredient.deal.discountPercent
                            ? `-${ingredient.deal.discountPercent}%`
                            : "bonus"}
                      </span>
                      {ingredient.deal.originalPrice &&
                        ingredient.deal.price !== null &&
                        ingredient.deal.originalPrice >
                          ingredient.deal.price && (
                          <s>{euro(ingredient.deal.originalPrice)}</s>
                        )}
                      {ingredient.deal.url && (
                        <a
                          href={ingredient.deal.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${ingredient.name} at ${ingredient.deal.storeName}`}
                        >
                          view ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="basket-deal basket-no-deal">
                      <span>≈ {euro(ingredient.price)}</span>
                      {ingredient.caught && (
                        <span className="caught-tag">caught</span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <footer className="basket-footer">
            <div>
              <span>Deal savings</span>
              <strong>{recipe.savings > 0 ? euro(recipe.savings) : "—"}</strong>
            </div>
            <button type="button" className="btn btn-secondary btn-block" onClick={copyShoppingList}>
              {copied ? "Copied shopping list" : "Copy shopping list"}
            </button>
            <p>
              Prices are estimates and package sizes vary. Always check the
              shelf price.
            </p>
          </footer>
        </aside>
      </section>

      <section className="method-section" aria-labelledby="method-title">
        <div className="method-card">
          <div className="method-heading">
            <div>
              <span className="eyebrow">Cook it</span>
              <h2 id="method-title">Method</h2>
            </div>
            <span className="method-meta">
              {recipe.minutes} min · serves {recipe.servings}
            </span>
          </div>
          <ol className="steps-list">
            {recipe.steps.map((step, index) => (
              <li key={step}>
                <span className="step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <div className="tip-card">
            <span aria-hidden="true">🧑‍🍳</span>
            <div>
              <strong>Cook's tip</strong>
              <p>{recipe.tip}</p>
            </div>
          </div>
        </div>

        <aside className="aside-card">
          <span className="eyebrow">Your game</span>
          <h2>{caughtTotal > 0 ? "Nice basket." : "Deals only."}</h2>
          {result.game.caught.length > 0 ? (
            <div className="caught-summary">
              {result.game.caught.map((item) => (
                <span className="caught-chip" key={item.id}>
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                  <strong>×{item.count}</strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="aside-copy">
              No ingredients made it into the basket — this pick leans on the
              best deals from your selected shops.
            </p>
          )}
          {result.game.goldenInfo &&
            result.game.caught.some(
              (item) => item.id === result.game.goldenInfo?.id
            ) && (
              <p className="aside-note">
                Golden ingredient:{" "}
                <span aria-hidden="true">{result.game.goldenInfo.emoji}</span>{" "}
                {result.game.goldenInfo.label}
              </p>
            )}
          <div className="aside-divider" />
          <p className="aside-copy">
            Built from{" "}
            <strong>
              {result.matchedStores.reduce(
                (total, store) => total + store.foodDeals,
                0
              )}{" "}
              food deals
            </strong>{" "}
            at{" "}
            {result.matchedStores.length > 0
              ? result.matchedStores.map((store) => store.short).join(", ")
              : "your shops"}
            .
          </p>
          <button type="button" className="btn btn-secondary btn-block" onClick={onOpenDeals}>
            See every deal
          </button>
        </aside>
      </section>

      {alternativeRecipes.length > 0 && (
        <section className="alternatives" aria-labelledby="alt-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Not feeling it?</span>
              <h2 id="alt-title">A few more dinner ideas</h2>
            </div>
            <button type="button" className="text-button" onClick={onNext}>
              Shuffle again
            </button>
          </div>
          <div className="alt-grid">
            {alternativeRecipes.slice(0, 3).map((alternative) => {
              const index = result.recipes.findIndex(
                (candidate) => candidate.id === alternative.id
              );
              const altTheme = themeFor(alternative);
              return (
                <button
                  type="button"
                  className="alt-card"
                  key={alternative.id}
                  onClick={() => onSelect(index)}
                  style={
                    {
                      "--theme-from": altTheme.from,
                      "--theme-to": altTheme.to,
                      "--theme-ink": altTheme.ink
                    } as CSSProperties
                  }
                >
                  <span className="alt-emoji" aria-hidden="true">
                    {alternative.emoji}
                  </span>
                  <span className="alt-vibe">{alternative.vibe}</span>
                  <strong>{alternative.title}</strong>
                  <span className="alt-subtitle">{alternative.subtitle}</span>
                  <span className="alt-meta">
                    <span>{alternative.minutes} min</span>
                    <span>{euro(alternative.cost)}</span>
                    <span>{alternative.onSaleCount} on sale</span>
                  </span>
                  <span className="alt-cta">Use this idea →</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="result-actions">
        <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" className="btn btn-quiet" onClick={onChangeShops}>
          Change shops
        </button>
        <button type="button" className="text-button" onClick={onNext}>
          Surprise me again
        </button>
      </div>
    </main>
  );
}
