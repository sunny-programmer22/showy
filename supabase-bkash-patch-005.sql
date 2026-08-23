-- ============================================================================
-- SHOWY — SCHEMA PATCH 005
-- bKash Tokenized Checkout support on orders
-- Idempotent: safe to run multiple times.
-- ============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'manual';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS bkash_payment_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_bkash_payment ON public.orders(bkash_payment_id);

-- ============================================================================
-- VERIFICATION:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='orders' AND column_name IN ('payment_provider','bkash_payment_id');
-- ============================================================================
