"use client";

import { useState } from "react";

type AccountType = "PRIME" | "FREES" | "DIRECT";
type AccountSize = "25K" | "50K" | "100K";

const TYPES: readonly AccountType[] = ["PRIME", "FREES", "DIRECT"];
const SIZES: readonly AccountSize[] = ["25K", "50K", "100K"];

/** Precio base por tamaño; el tipo aplica un multiplicador. */
const BASE_PRICE: Record<AccountSize, number> = {
  "25K": 28,
  "50K": 79,
  "100K": 149,
};

const TYPE_FACTOR: Record<AccountType, number> = {
  PRIME: 1,
  FREES: 0.82,
  DIRECT: 1.24,
};

const TARGET: Record<AccountSize, string> = {
  "25K": "$1,500",
  "50K": "$3,000",
  "100K": "$6,000",
};

const DRAWDOWN: Record<AccountSize, string> = {
  "25K": "$1,000",
  "50K": "$2,000",
  "100K": "$3,000",
};

const EOD_ADDON = 19;

export function TaurusPricing() {
  const [type, setType] = useState<AccountType>("PRIME");
  const [size, setSize] = useState<AccountSize>("50K");
  const [eod, setEod] = useState(false);

  const monthly = Math.round(BASE_PRICE[size] * TYPE_FACTOR[type]) + (eod ? EOD_ADDON : 0);

  return (
    <section className="taurus-pricing" aria-labelledby="taurus-pricing-title">
      <header className="taurus-section-head">
        <p className="taurus-eyebrow">Our Pricing Plans</p>
        <h2 id="taurus-pricing-title">Built around your trading style.</h2>
      </header>

      <div className="taurus-config">
        <fieldset className="taurus-config__group">
          <legend>Account Type</legend>
          <div className="taurus-seg">
            {TYPES.map((option) => (
              <button
                key={option}
                type="button"
                className={`taurus-seg__btn${type === option ? " is-active" : ""}`}
                onClick={() => setType(option)}
                aria-pressed={type === option}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="taurus-config__group">
          <legend>Account Size</legend>
          <div className="taurus-seg">
            {SIZES.map((option) => (
              <button
                key={option}
                type="button"
                className={`taurus-seg__btn${size === option ? " is-active" : ""}`}
                onClick={() => setSize(option)}
                aria-pressed={size === option}
              >
                {option}
                {option === "50K" && <span className="taurus-tag">Popular</span>}
              </button>
            ))}
          </div>
        </fieldset>

        <dl className="taurus-config__specs">
          <div>
            <dt>Profit Target</dt>
            <dd>{TARGET[size]}</dd>
          </div>
          <div>
            <dt>Trailing Drawdown</dt>
            <dd>{DRAWDOWN[size]}</dd>
          </div>
          <div>
            <dt>Max Contracts</dt>
            <dd>{size === "100K" ? 8 : size === "50K" ? 4 : 2}</dd>
          </div>
        </dl>

        <label className="taurus-toggle">
          <input
            type="checkbox"
            checked={eod}
            onChange={(event) => setEod(event.target.checked)}
          />
          <span className="taurus-toggle__track" aria-hidden />
          <span>
            EOD Drawdown <em>+${EOD_ADDON}</em>
          </span>
        </label>
      </div>

      <div className="taurus-pricebar" role="status" aria-live="polite">
        <div>
          <span className="taurus-pricebar__label">
            {size} Exclusive — {type}
          </span>
          <span className="taurus-pricebar__price">
            ${monthly}
            <em>/month</em>
          </span>
        </div>
        <button type="button" className="taurus-btn">
          Get Started
        </button>
      </div>
    </section>
  );
}
