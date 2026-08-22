-- ============================================================================
-- SHOWY — SCHEMA PATCH 003
-- Coupons / Promotions + order-level discounts
--
-- HOW TO APPLY:
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run
--   Idempotent: safe to run multiple times.
--
-- WHAT IT DOES:
--   • Adds a coupons table (percent or fixed-৳ discounts with rules).
--   • Adds orders.discount_amount + orders.coupon_code so invoices remember
--     which promo was applied.
--   • Auto-increments used_count when a paid order records the code.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) COUPONS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id               UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  code             TEXT NOT NULL UNIQUE,
  discount_type    TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value   NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_discount     NUMERIC(12,2),                -- cap for percent coupons; NULL = no cap
  usage_limit      INTEGER,                      -- NULL = unlimited
  used_count       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Codes are validated at checkout by exact match; reading the table is fine
-- (a guessed code would be redeemable anyway). Writes are admin-only.
DROP POLICY IF EXISTS "coupons_public_read" ON public.coupons;
CREATE POLICY "coupons_public_read" ON public.coupons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "coupons_admin_write" ON public.coupons;
CREATE POLICY "coupons_admin_write" ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2) ORDERS: remember applied promo
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- ---------------------------------------------------------------------------
-- 3) USAGE COUNTER — bumps when an order carrying the code is inserted
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL AND NEW.discount_amount > 0 THEN
    UPDATE public.coupons
       SET used_count = used_count + 1
     WHERE code = UPPER(NEW.coupon_code);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_coupon_usage ON public.orders;
CREATE TRIGGER trg_bump_coupon_usage
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.bump_coupon_usage();

-- ============================================================================
-- VERIFICATION (run after applying):
--   SELECT column_name FROM information_schema.columns WHERE table_name='coupons';
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='orders' AND column_name IN ('discount_amount','coupon_code');
--
-- Create your first test coupon:
--   INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount)
--   VALUES ('SHOWY10', 'percent', 10, 1000);
-- ============================================================================
