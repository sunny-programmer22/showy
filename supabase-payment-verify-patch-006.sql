-- ============================================================================
-- SHOWY — SCHEMA PATCH 006
-- Manual payment verification (Option A): admins mark bkash/nagad orders paid
-- Idempotent.
-- ============================================================================

DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
