-- ============================================================================
-- SHOWY — SCHEMA PATCH 002
-- Size / Variant Options (product_variants) + order line variant labels
--
-- HOW TO APPLY:
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run
--   Idempotent: safe to run multiple times.
--
-- WHAT IT DOES:
--   • Adds a product_variants table so sellers can offer Size options
--     ("S", "M", "L"…) each with its own stock and optional price override.
--   • Adds order_items.variant_label so purchased lines remember which
--     option the customer picked.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) PRODUCT VARIANTS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id           UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_name  TEXT NOT NULL DEFAULT 'Size',   -- 'Size', 'Color', …
  option_value TEXT NOT NULL,                  -- 'S', 'M', 'XL'…
  price        NUMERIC(12,2),                  -- NULL → inherit base price
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product
  ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can read variants of visible products.
DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
CREATE POLICY "variants_public_read" ON public.product_variants
  FOR SELECT USING (true);

-- Only the owning shop's vendor (or an admin) may manage variants.
DROP POLICY IF EXISTS "variants_owner_insert" ON public.product_variants;
CREATE POLICY "variants_owner_insert" ON public.product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.products p
      JOIN public.shops s ON s.id = p.shop_id
      WHERE p.id = product_variants.product_id
        AND (s.owner_id = AUTH.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "variants_owner_update" ON public.product_variants;
CREATE POLICY "variants_owner_update" ON public.product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      JOIN public.shops s ON s.id = p.shop_id
      WHERE p.id = product_variants.product_id
        AND (s.owner_id = AUTH.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "variants_owner_delete" ON public.product_variants;
CREATE POLICY "variants_owner_delete" ON public.product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      JOIN public.shops s ON s.id = p.shop_id
      WHERE p.id = product_variants.product_id
        AND (s.owner_id = AUTH.uid() OR public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- 2) ORDER ITEMS: remember which variant was bought
-- ---------------------------------------------------------------------------
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_label TEXT;

-- ============================================================================
-- VERIFICATION (run after applying):
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'product_variants';
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'order_items' AND column_name = 'variant_label';
-- ============================================================================
