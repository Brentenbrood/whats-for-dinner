import { useEffect, useState } from "react";
import { fetchMeta, fetchRecipe } from "./api";
import DealsDrawer from "./components/DealsDrawer";
import ResultView from "./components/ResultView";
import StorePicker from "./components/StorePicker";
import DinnerGame from "./game/DinnerGame";
import type { GameOutcome, Meta, RecipeResponse } from "./types";

type Stage = "setup" | "game" | "loading" | "result";

function formatFreshness(value: string | null) {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function App() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [selection, setSelection] = useState<string[] | null>(null);
  const [stage, setStage] = useState<Stage>("setup");
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [result, setResult] = useState<RecipeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [dealsOpen, setDealsOpen] = useState(false);

  function loadMeta() {
    setMetaError(null);
    fetchMeta()
      .then((payload) => {
        setMeta(payload);
        setSelection((current) => {
          if (current !== null) return current;
          const available = payload.stores
            .filter((store) => store.foodDeals > 0)
            .map((store) => store.id);
          return available.length ? available : payload.stores.map((store) => store.id);
        });
      })
      .catch((cause: Error) => setMetaError(cause.message));
  }

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage]);

  const selected = selection ?? [];

  function startGame() {
    if (!selected.length) return;
    setResult(null);
    setOutcome(null);
    setError(null);
    setRecipeIndex(0);
    setStage("game");
  }

  function handleFinish(gameOutcome: GameOutcome) {
    setOutcome(gameOutcome);
    setStage("loading");
    setError(null);
    fetchRecipe(selected, {
      counts: gameOutcome.counts,
      golden: gameOutcome.golden,
      topCategory: gameOutcome.topCategory,
      score: gameOutcome.score
    })
      .then((payload) => {
        setResult(payload);
        setRecipeIndex(0);
        setStage("result");
      })
      .catch((cause: Error) => {
        setError(cause.message);
        setStage("setup");
      });
  }

  function resetToSetup() {
    setStage("setup");
    setResult(null);
    setOutcome(null);
    setRecipeIndex(0);
    setError(null);
  }

  function playAgain() {
    setResult(null);
    setRecipeIndex(0);
    setStage("game");
  }

  function selectRecipe(index: number) {
    setRecipeIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextRecipe() {
    if (!result) return;
    setRecipeIndex((current) => (current + 1) % result.recipes.length);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <header className="site-header">
        <button
          type="button"
          className="brand"
          onClick={resetToSetup}
          aria-label="What's for dinner — start over"
        >
          <span className="brand-mark" aria-hidden="true">
            🍲
          </span>
          <span className="brand-copy">
            <strong>What's for dinner?</strong>
            <small>Deals in. Dinner out.</small>
          </span>
        </button>
        <div className="header-actions">
          {meta && (
            <span className="live-pill">
              <span className="live-dot" aria-hidden="true" />
              {meta.foodDealCount} food deals live
            </span>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => setDealsOpen(true)}
            disabled={!meta}
          >
            Browse deals
          </button>
        </div>
      </header>

      {!meta && !metaError && (
        <main className="loading-page">
          <div className="loading-plate" aria-hidden="true">
            <span>🍲</span>
          </div>
          <span className="eyebrow">Warming up</span>
          <h1>Checking tonight's folders…</h1>
          <p>Collecting this week's food deals from six supermarkets.</p>
        </main>
      )}

      {!meta && metaError && (
        <main className="loading-page">
          <div className="loading-plate error-plate" aria-hidden="true">
            <span>🧺</span>
          </div>
          <span className="eyebrow">Kitchen mishap</span>
          <h1>We couldn't load the deals.</h1>
          <p>{metaError}</p>
          <button type="button" className="btn btn-primary" onClick={loadMeta}>
            Try again
          </button>
        </main>
      )}

      {meta && stage === "setup" && (
        <main className="setup-page">
          {error && (
            <div className="error-banner" role="alert">
              <span>
                <strong>The recipe engine stumbled.</strong> {error}
              </span>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Supermarket roulette</span>
              <h1>
                Stop asking.
                <br />
                <em>Start catching.</em>
              </h1>
              <p className="hero-lede">
                Pick your supermarkets, play a 30-second food-catching game, and
                get a dinner recipe built around what's actually on sale. No
                scrolling through six folders required.
              </p>
              <div className="hero-cta">
                <a
                  className="btn btn-primary btn-large"
                  href="#stores"
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById("stores")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Pick your shops
                </a>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => setDealsOpen(true)}
                >
                  Peek at the deals
                </button>
              </div>
              <div className="hero-proof">
                <div>
                  <strong>{meta.foodDealCount}</strong>
                  <span>food deals live</span>
                </div>
                <div>
                  <strong>{meta.stores.length}</strong>
                  <span>supermarkets</span>
                </div>
                <div>
                  <strong>{meta.recipeCount}</strong>
                  <span>recipes in the bank</span>
                </div>
              </div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-orbit orbit-one">🥕</div>
              <div className="hero-orbit orbit-two">🧄</div>
              <div className="hero-orbit orbit-three">🌿</div>
              <div className="hero-orbit orbit-four">🍋</div>
              <div className="plate">
                <span className="plate-emoji">🍝</span>
                <span className="plate-ring" />
              </div>
              <div className="hero-note">
                <span className="hero-note-dot" />
                Tonight's plan: deliciously undecided
              </div>
            </div>
          </section>

          <div id="stores">
            <StorePicker
              stores={meta.stores}
              selected={selected}
              onChange={setSelection}
            />
          </div>

          <div className="start-bar">
            <div className="start-copy">
              <strong>
                {selected.length > 0
                  ? `${selected.length} shop${selected.length === 1 ? "" : "s"} selected`
                  : "Pick at least one shop"}
              </strong>
              <span>
                {selected.length > 0
                  ? "We'll only recommend recipes that make the most of their discounts."
                  : "The more shops you pick, the more deals we can match."}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={startGame}
              disabled={selected.length === 0}
            >
              Start the dinner dash <span aria-hidden="true">→</span>
            </button>
          </div>

          <section className="how-section" aria-labelledby="how-title">
            <div className="section-heading">
              <div>
                <span className="eyebrow">How it works</span>
                <h2 id="how-title">Three steps to dinner</h2>
              </div>
              <span className="freshness">
                Deals refreshed {formatFreshness(meta.generatedAt)}
              </span>
            </div>
            <div className="how-grid">
              <article className="how-card">
                <span className="how-number">01</span>
                <span className="how-icon" aria-hidden="true">
                  🛒
                </span>
                <h3>Pick the shops</h3>
                <p>
                  Choose Albert Heijn, Dirk, Jumbo, PLUS, Lidl, ALDI — or any
                  combination. We pull their current food deals.
                </p>
              </article>
              <article className="how-card">
                <span className="how-number">02</span>
                <span className="how-icon" aria-hidden="true">
                  🧺
                </span>
                <h3>Catch some dinner</h3>
                <p>
                  Drag the basket and scoop falling ingredients for 30 seconds.
                  Golden ingredients count triple.
                </p>
              </article>
              <article className="how-card">
                <span className="how-number">03</span>
                <span className="how-icon" aria-hidden="true">
                  🍽️
                </span>
                <h3>Cook the result</h3>
                <p>
                  Get a recipe scored on your basket and the best deals, with a
                  shopping list and three backup ideas.
                </p>
              </article>
            </div>
          </section>
        </main>
      )}

      {meta && stage === "game" && (
        <main className="game-page">
          <div className="game-page-head">
            <div>
              <span className="eyebrow">Step 2</span>
              <h1>Dinner dash</h1>
              <p>
                Catch ingredients, dodge nothing, and let the basket decide
                tonight's direction.
              </p>
            </div>
            <div className="selected-stores" aria-label="Selected supermarkets">
              {meta.stores
                .filter((store) => selected.includes(store.id))
                .map((store) => (
                  <span
                    className="store-badge"
                    key={store.id}
                    style={{ background: store.color, color: store.ink }}
                  >
                    {store.short}
                  </span>
                ))}
            </div>
          </div>
          <DinnerGame
            key="dinner-dash"
            ingredients={meta.gameIngredients}
            duration={30}
            onFinish={handleFinish}
          />
        </main>
      )}

      {meta && stage === "loading" && (
        <main className="loading-page loading-recipe">
          <div className="loading-plate" aria-hidden="true">
            <span>{outcome?.caught[0]?.emoji ?? "🍲"}</span>
          </div>
          <span className="eyebrow">Step 3</span>
          <h1>Tasting your basket…</h1>
          <p>
            Matching {outcome?.caught.length ?? 0} caught ingredients against{" "}
            {meta.foodDealCount} live food deals.
          </p>
          {outcome && outcome.caught.length > 0 && (
            <div className="loading-chips">
              {outcome.caught.map((item) => (
                <span className="caught-chip" key={item.id}>
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                  <strong>×{item.count}</strong>
                </span>
              ))}
            </div>
          )}
          <div className="loading-line" aria-hidden="true">
            <span />
          </div>
        </main>
      )}

      {meta && stage === "result" && result && (
        <ResultView
          result={result}
          activeIndex={recipeIndex}
          onSelect={selectRecipe}
          onNext={nextRecipe}
          onPlayAgain={playAgain}
          onChangeShops={resetToSetup}
          onOpenDeals={() => setDealsOpen(true)}
        />
      )}

      <footer className="site-footer">
        <p>
          <span aria-hidden="true">🍽️</span> Deals scraped from Albert Heijn,
          Dirk, Jumbo, PLUS, Lidl and ALDI. Prices and availability can change —
          always check the shop.
        </p>
        <span>
          {meta
            ? `${meta.dealCount} deals · refreshed ${formatFreshness(meta.generatedAt)}`
            : "Loading deals…"}
        </span>
      </footer>

      {meta && dealsOpen && (
        <DealsDrawer
          stores={meta.stores}
          selected={selected}
          onClose={() => setDealsOpen(false)}
        />
      )}
    </div>
  );
}
