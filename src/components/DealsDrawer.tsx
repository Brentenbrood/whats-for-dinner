import { useEffect, useMemo, useState } from "react";
import { fetchDeals } from "../api";
import type { Deal, Store } from "../types";

interface DealsDrawerProps {
  stores: Store[];
  selected: string[];
  onClose: () => void;
}

function euro(value: number | null) {
  return value === null ? "—" : `€${value.toFixed(2).replace(".", ",")}`;
}

export default function DealsDrawer({
  stores,
  selected,
  onClose
}: DealsDrawerProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchDeals(selected)
      .then((payload) => {
        if (!active) return;
        setDeals(payload.deals);
      })
      .catch((cause: Error) => {
        if (!active) return;
        setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const visibleStores = stores.filter(
    (store) => selected.length === 0 || selected.includes(store.id)
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return deals.filter((deal) => {
      if (storeFilter !== "all" && deal.store !== storeFilter) return false;
      if (!needle) return true;
      return `${deal.name} ${deal.brand ?? ""} ${deal.storeName}`
        .toLowerCase()
        .includes(needle);
    });
  }, [deals, query, storeFilter]);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <section
        className="deals-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deals-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <span className="eyebrow">This week</span>
            <h2 id="deals-title">Food deals</h2>
            <p>
              {loading
                ? "Loading the latest folder…"
                : `${filtered.length} of ${deals.length} deals shown`}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close deals"
          >
            ×
          </button>
        </header>

        <div className="drawer-tools">
          <label className="search-field">
            <span className="sr-only">Search deals</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chicken, pasta, cheese…"
            />
          </label>
          <div className="filter-chips" role="group" aria-label="Filter by store">
            <button
              type="button"
              className={storeFilter === "all" ? "is-active" : ""}
              onClick={() => setStoreFilter("all")}
            >
              All
            </button>
            {visibleStores.map((store) => (
              <button
                key={store.id}
                type="button"
                className={storeFilter === store.id ? "is-active" : ""}
                onClick={() => setStoreFilter(store.id)}
              >
                <span
                  className="filter-dot"
                  style={{ background: store.color }}
                  aria-hidden="true"
                />
                {store.short}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-body">
          {loading && (
            <div className="deal-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="deal-card deal-skeleton" key={index} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <span aria-hidden="true">🧺</span>
              <h3>Couldn't load the deals</h3>
              <p>{error}</p>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <span aria-hidden="true">🔍</span>
              <h3>No deals match that</h3>
              <p>Try another search or switch the store filter.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setQuery("");
                  setStoreFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="deal-grid">
              {filtered.map((deal) => (
                <article className="deal-card" key={deal.id}>
                  <div className="deal-thumb">
                    <span className="deal-fallback" aria-hidden="true">
                      🛒
                    </span>
                    {deal.image && (
                      <img
                        src={deal.image}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div className="deal-body">
                    <span
                      className="store-badge"
                      style={{
                        background: deal.storeColor,
                        color: deal.storeInk
                      }}
                    >
                      {deal.storeShort}
                    </span>
                    <h3>{deal.name}</h3>
                    <div className="deal-price-row">
                      <strong>
                        {deal.price !== null
                          ? euro(deal.price)
                          : deal.discountPercent
                            ? `-${deal.discountPercent}%`
                            : "Bonus"}
                      </strong>
                      {deal.originalPrice &&
                        deal.price !== null &&
                        deal.originalPrice > deal.price && (
                          <s>{euro(deal.originalPrice)}</s>
                        )}
                      {deal.discountLabel && (
                        <span className="discount-pill">
                          {deal.discountLabel}
                        </span>
                      )}
                    </div>
                    {deal.unit && <p className="deal-unit">{deal.unit}</p>}
                    {deal.url && (
                      <a
                        className="deal-link"
                        href={deal.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View at {deal.storeName} ↗
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
