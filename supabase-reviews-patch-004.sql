-- ============================================================================
-- SHOWY — SCHEMA PATCH 004
-- Product Reviews (+ automatic rating aggregation)
--
-- HOW TO APPLY:
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run
--   Idempotent: safe to run multiple times.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id         UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name  TEXT NOT NULL DEFAULT '',
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON public.product_reviews(product_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read" ON public.product_reviews;
CREATE POLICY "reviews_public_read" ON public.product_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_user_insert" ON public.product_reviews;
CREATE POLICY "reviews_user_insert" ON public.product_reviews
  FOR INSERT WITH CHECK (AUTH.uid() = user_id);

DROP POLICY IF EXISTS "reviews_owner_update" ON public.product_reviews;
CREATE POLICY "reviews_owner_update" ON public.product_reviews
  FOR UPDATE USING (AUTH.uid() = user_id)
  WITH CHECK (AUTH.uid() = user_id);

DROP POLICY IF EXISTS "reviews_owner_delete" ON public.product_reviews;
CREATE POLICY "reviews_owner_delete" ON public.product_reviews
  FOR DELETE USING (AUTH.uid() = user_id OR public.is_admin());

-- ---------------------------------------------------------------------------
-- Rating aggregation trigger: keeps products.rating / reviews_count in sync
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product UUID := COALESCE(NEW.product_id, OLD.product_id);
BEGIN
  UPDATE public.products p
     SET rating        = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.product_reviews WHERE product_id = v_product), 5.0),
         reviews_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = v_product)
   WHERE p.id = v_product;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_product_rating ON public.product_reviews;
CREATE TRIGGER trg_sync_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_rating();

-- ============================================================================
-- VERIFICATION:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'product_reviews';
-- ============================================================================
