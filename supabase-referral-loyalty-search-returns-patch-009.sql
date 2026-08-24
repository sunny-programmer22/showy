-- ============================================================
-- SHOWY PATCH 009: Referral / Loyalty / Full-text search / Returns
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 1) profiles: ban + loyalty
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- 2) referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referee_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referrals' AND policyname='referrals_own') THEN
    CREATE POLICY referrals_own ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referrals' AND policyname='referrals_insert') THEN
    CREATE POLICY referrals_insert ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referee_id);
  END IF;
END $$;

-- 3) Full-text search tsvector for products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_tsv TSVECTOR;
CREATE INDEX IF NOT EXISTS products_search_tsv_idx ON public.products USING GIN (search_tsv);
CREATE OR REPLACE FUNCTION public.products_search_tsv_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_tsv := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,'') || ' ' || array_to_string(NEW.tags,' ') || ' ' || coalesce(NEW.category,''));
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS products_search_tsv_trigger ON public.products;
CREATE TRIGGER products_search_tsv_trigger BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_search_tsv_update();
-- backfill
UPDATE public.products SET search_tsv = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || array_to_string(tags,' ') || ' ' || coalesce(category,''));

-- 4) Helper function for search (used by frontend if desired)
CREATE OR REPLACE FUNCTION public.search_products(q TEXT)
RETURNS SETOF public.products AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.products WHERE search_tsv @@ plainto_tsquery('english', q) AND is_active = TRUE LIMIT 20;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) orders: allow cancelled / return_requested statuses (check constraint if exists)
-- Extend order_items status check if enum-like constraint exists — loosen to allow new statuses via text (no constraint by default)
