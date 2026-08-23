# bKash Merchant PGW (Tokenized Checkout) — Setup Guide

The full integration is already built. This is what YOU must do to switch it on.

## 1. Get a bKash merchant account (you)

1. Apply at https://merchant.bka.sh — you'll need:
   - Trade license
   - NID
   - TIN certificate
   - Bank account in the business name
2. After approval, bKash gives you **sandbox** credentials immediately and
   **live** credentials after compliance review:
   - `APP_KEY`, `APP_SECRET`, `USERNAME`, `PASSWORD`

## 2. Apply database patch

Supabase SQL Editor → run `supabase-bkash-patch-005.sql`.

## 3. Deploy the two Edge Functions (one-time)

Install Supabase CLI once (`npm i -g supabase`), log in (`supabase login`,
`supabase link --project-ref <your-ref>` from this folder), then:

```bash
supabase secrets set \
  BKASH_APP_KEY=xxx BKASH_APP_SECRET=xxx \
  BKASH_USERNAME=xxx BKASH_PASSWORD=xxx \
  BKASH_MODE=sandbox \
  SITE_URL=https://showy.jubair.bond

supabase functions deploy bkash-create-payment
supabase functions deploy bkash-execute-payment
```

When bKash approves live access: set `BKASH_MODE=live` and redeploy secrets.

Note: sandbox testing requires the bKash sandbox wallet app or their simulator.

## 4. Flip the frontend flag

GitHub repo → Settings → Secrets and variables → Actions → New secret:

- Name: `VITE_BKASH_ENABLED`
- Value: `true`

Push any commit (or re-run the deploy workflow). Checkout now redirects bKash
payers through the real gateway; orders are only marked paid after server-side
verification of the transaction.

## How the flow works after enablement

1. Customer clicks "Pay with bKash" at checkout
2. App calls `bkash-create-payment` → gets official `bkashURL`
3. Customer authorizes on bKash's own page (real OTP/PIN)
4. bKash redirects back to `/bkash/callback?paymentID=…&status=success`
5. App calls `bkash-execute-payment` → bKash confirms + returns real TrxID
6. Order is placed and marked **paid** with that TrxID — no trust required

Until step 4's flag is on, checkout keeps the demo simulator (clearly not real).
