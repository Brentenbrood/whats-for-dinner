import type { CSSProperties } from "react";
import type { Store } from "../types";

interface StorePickerProps {
  stores: Store[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function StorePicker({
  stores,
  selected,
  onChange
}: StorePickerProps) {
  const selectedSet = new Set(selected);
  const available = stores.filter((store) => store.foodDeals > 0);

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(selected.filter((storeId) => storeId !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <section className="store-section" aria-labelledby="store-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Step 1</span>
          <h2 id="store-heading">Where are you shopping?</h2>
          <p>We'll only use deals from the shops you pick.</p>
        </div>
        <div className="section-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => onChange(available.map((store) => store.id))}
          >
            Select all
          </button>
          <span className="dot-divider" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className="text-button"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="store-grid">
        {stores.map((store) => {
          const active = selectedSet.has(store.id);
          return (
            <button
              key={store.id}
              type="button"
              className={`store-card${active ? " is-active" : ""}`}
              aria-pressed={active}
              onClick={() => toggle(store.id)}
              style={
                {
                  "--store-color": store.color,
                  "--store-ink": store.ink
                } as CSSProperties
              }
            >
              <span
                className="store-mark"
                style={{ background: store.color, color: store.ink }}
              >
                {store.short}
              </span>
              <span className="store-copy">
                <strong>{store.name}</strong>
                <span>
                  {store.foodDeals > 0
                    ? `${store.foodDeals} food deals`
                    : "No food deals found"}
                </span>
              </span>
              <span className="store-check" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
