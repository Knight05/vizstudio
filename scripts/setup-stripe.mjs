#!/usr/bin/env node
/**
 * One-time Stripe setup: creates the Viz Studio product with Monthly ($50/mo)
 * and Annual ($500/yr) prices, then prints the env lines to paste into
 * .env (local) and Vercel (production).
 *
 * Usage:  STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.mjs
 * Idempotent: re-running finds existing prices by lookup_key instead of duplicating.
 */

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY || !KEY.startsWith("sk_")) {
  console.error("Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...) and re-run.");
  process.exit(1);
}

const API = "https://api.stripe.com/v1";
async function stripe(path, params) {
  const res = await fetch(`${API}/${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const json = await res.json();
  if (json.error) throw new Error(`${path}: ${json.error.message}`);
  return json;
}

async function findOrCreatePrice(lookupKey, productId, params) {
  const existing = await stripe(`prices?lookup_keys[]=${lookupKey}&limit=1`);
  if (existing.data?.length) return existing.data[0];
  return stripe("prices", { product: productId, lookup_key: lookupKey, ...params });
}

// 1. Product
const products = await stripe(`products/search?query=${encodeURIComponent('name:"Viz Studio"')}`);
const product =
  products.data?.find((p) => p.active) ??
  (await stripe("products", {
    name: "Viz Studio",
    description: "Full Viz Studio chart library — 75+ premium Looker Studio visualizations.",
  }));
console.log("product:", product.id);

// 2. Prices ($50/mo, $500/yr)
const monthly = await findOrCreatePrice("viz_monthly_50", product.id, {
  currency: "usd",
  unit_amount: "5000",
  "recurring[interval]": "month",
  nickname: "Monthly — $50/mo",
});
const yearly = await findOrCreatePrice("viz_annual_500", product.id, {
  currency: "usd",
  unit_amount: "50000",
  "recurring[interval]": "year",
  nickname: "Annual — $500/yr",
});

console.log(`
Paste into .env and Vercel env vars:

STRIPE_PRICE_PRO_MONTHLY="${monthly.id}"
STRIPE_PRICE_PRO_YEARLY="${yearly.id}"

Also required in Vercel:
STRIPE_SECRET_KEY        (this key)
STRIPE_WEBHOOK_SECRET    (from https://dashboard.stripe.com/webhooks — endpoint: https://vizstudio.io/api/stripe/webhook)
`);
