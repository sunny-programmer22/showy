# Showy — SEO Keyword Guide

## The truth about "300–400 keywords"

Google has **ignored the meta keywords tag since 2009**, and pages stuffed with
hundreds of keyword lists get flagged as spam. There is no file you can add 400
words to and rank for them.

**How you actually get hundreds of keywords:** every product you upload becomes
an indexable page at `https://showy.jubair.bond/product/<id>/` with an automatic
SEO title like:

> `Adidas Real Madrid Home Jersey 24/25 — Buy Online in Bangladesh | Showy`

That single product page targets these searches on its own:

- adidas real madrid jersey bangladesh
- real madrid home jersey 24/25 price in bd
- buy football jersey online bangladesh
- football jersey price in bd
- adidas jersey bd

**100 products × ~5 search variations = 500+ keyword entry points.**
The catalog is the keyword list. Upload descriptive products, not more meta tags.

## Product naming pattern (use this when uploading)

`[Brand] [Team/Model/Type] [Key attribute] — e.g.`

- ✅ "Lakers NBA Basketball Jersey – LeBron #23 Black Edition"
- ❌ "Nice shirt"

Good titles → good Google titles → long-tail traffic.

## Core keywords already placed (meta tags + homepage copy)

- Brand: showy store, showy store bd, showy, showy bd, showy bangladesh, showy marketplace
- Platform: online shopping bangladesh / bd, multi-vendor marketplace,
  ecommerce platform bangladesh, online shop bangladesh, best online shopping site bd
- Payments: bkash payment online shopping, nagad payment online shopping,
  cash on delivery bangladesh / bd, cod online shopping
- Trust: verified online seller bd, trusted online shop bangladesh, nationwide delivery bangladesh
- Local: online shop dhaka, chattogram online store, rangpur online shopping, gaibandha online store
- Selling: sell online bangladesh, open online shop bd, vendor marketplace bd

These are covered by: `index.html` (description + keywords + JSON-LD),
per-route `<title>`/description (`src/lib/seo.ts` calls in `src/App.tsx`),
and the visible homepage SEO block.

## To rank for a specific phrase

1. It must appear naturally in page content (title, description, or body text).
2. That page must be indexed (check with `site:` search or GSC URL Inspection).
3. You need a few external links pointing at it (Facebook posts count).

Want to target something specific (e.g. "jersey price in bd")? Make sure a
product title literally contains those words.
