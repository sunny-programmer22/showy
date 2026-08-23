-- ============================================================
-- SHOWY PATCH 007: Admin central verification + transactions ledger
-- Run in Supabase Dashboard > SQL Editor > New query > paste > RUN
-- Safe to re-run (idempotent).
-- ============================================================

-- 1) Admin can update orders (re-add if patch 006 was skipped)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_admin_update') THEN
    CREATE POLICY orders_admin_update ON public.orders
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

-- 2) Admin can update order items (needed to auto-move items to processing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='order_items_admin_update') THEN
    CREATE POLICY order_items_admin_update ON public.order_items
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

-- 3) Transaction ledger view (admins only)
CREATE OR REPLACE VIEW public.v_shop_transactions AS
SELECT
  o.created_at,
  o.order_number,
  s.id   AS shop_id,
  s.name AS shop_name,
  i.product_title,
  i.quantity,
  i.total_price                       AS line_total,
  ROUND(i.total_price * 0.05, 2)      AS commission,
  ROUND(i.total_price * 0.95, 2)      AS seller_net,
  o.payment_method,
  o.transaction_id,
  o.payment_status,
  i.status                            AS item_status
FROM public.order_items i
JOIN public.products p ON p.id = i.product_id
JOIN public.shops   s ON s.id = p.shop_id
JOIN public.orders  o ON o.id = i.order_id
WHERE public.is_admin();

GRANT SELECT ON public.v_shop_transactions TO authenticated;
