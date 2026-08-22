-- ============================================================================
-- SHOPTASTIC.BD — COMPLETE SUPABASE SETUP SCRIPT  (v2 — fixed run order)
-- Multi-Vendor E-Commerce Platform (GitHub Pages Frontend + Supabase Backend)
--
-- HOW TO USE:
--   1. Open your Supabase Dashboard → SQL Editor
--   2. Paste this ENTIRE file and click "Run"
--   3. Done! Tables, triggers, functions, RLS & storage fully configured.
--
-- ORDER FIXED: All TABLES are created FIRST, then FUNCTIONS/TRIGGERS,
--              then RLS policies, then storage.
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 2: TABLES (created first!)
-- ============================================================================

-- ------------------------------ PROFILES ------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'customer'
              CHECK (role IN ('customer', 'vendor', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------- SHOPS --------------------------------------
CREATE TABLE IF NOT EXISTS public.shops (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT DEFAULT '',
  logo_url             TEXT,
  banner_url           TEXT,
  is_admin_shop        BOOLEAN NOT NULL DEFAULT FALSE, -- your future flagship store
  is_verified          BOOLEAN NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  rating               NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  reviews_count        INTEGER NOT NULL DEFAULT 0,
  bkash_payout_number  TEXT,
  nagad_payout_number  TEXT,
  bank_info            JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug  ON public.shops(slug);

-- ------------------------------ PRODUCTS ------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id        UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT DEFAULT '',
  category       TEXT NOT NULL,
  subcategory    TEXT,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  price          NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(12,2) CHECK (discount_price IS NULL OR discount_price >= 0),
  stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images         TEXT[] NOT NULL DEFAULT '{}',
  rating         NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  reviews_count  INTEGER NOT NULL DEFAULT 0,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  is_returnable  BOOLEAN NOT NULL DEFAULT TRUE, -- seller opt-out for returns
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_shop     ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- ------------------------------- ORDERS -------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number       TEXT NOT NULL UNIQUE,
  customer_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name      TEXT NOT NULL,
  customer_email     TEXT,
  customer_phone     TEXT NOT NULL,
  shipping_address   JSONB NOT NULL,
  total_amount       NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  delivery_fee       NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fee_total NUMERIC(12,2) NOT NULL DEFAULT 0, -- sum of all 5% cuts
  payment_method     TEXT NOT NULL CHECK (payment_method IN ('bkash','nagad','card','cod')),
  payment_status     TEXT NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed')),
  transaction_id     TEXT,
  overall_status     TEXT NOT NULL DEFAULT 'pending'
                     CHECK (overall_status IN ('pending','processing','shipped','delivered','cancelled')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------- ORDER ITEMS ----------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id               UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  product_id            UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title         TEXT NOT NULL,
  product_image         TEXT,
  unit_price            NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  quantity              INTEGER NOT NULL CHECK (quantity > 0),
  total_price           NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  is_admin_shop         BOOLEAN NOT NULL DEFAULT FALSE,
  admin_commission_5pct NUMERIC(12,2) NOT NULL DEFAULT 0, -- auto-computed below
  vendor_amount_95pct   NUMERIC(12,2) NOT NULL DEFAULT 0, -- auto-computed below
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','shipped','delivered'))
);

CREATE INDEX IF NOT EXISTS idx_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_shop  ON public.order_items(shop_id);

-- ---------------------------- VENDOR WALLETS --------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_wallets (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id               UUID NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
  total_earnings_95pct  NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_balance       NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_clearance     NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_withdrawn       NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------- PAYOUT REQUESTS -------------------------------
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id         UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('bkash','nagad','bank')),
  account_number  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','transferred')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);

-- ------------------------------- REVIEWS ------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL DEFAULT '',
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ============================================================================
-- SECTION 3: HELPER FUNCTIONS (now safe — tables already exist)
-- ============================================================================

-- Is the current logged-in user a Super Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Does the current user own the given shop?
CREATE OR REPLACE FUNCTION public.owns_shop(target_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = target_shop_id AND owner_id = auth.uid()
  );
$$;

-- ============================================================================
-- SECTION 4: TRIGGERS & AUTOMATION FUNCTIONS
-- ============================================================================

-- Auto-create a profile whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'customer'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- AUTOMATIC COMMISSION SPLIT ENGINE (5% platform / 95% vendor)
-- • Admin flagship store item → platform keeps 100%
-- • Third-party vendor item   → 5% + 95% columns filled automatically
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.split_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin_shop BOOLEAN;
BEGIN
  SELECT COALESCE(s.is_admin_shop, FALSE) INTO v_is_admin_shop
  FROM public.shops s WHERE s.id = NEW.shop_id;

  NEW.is_admin_shop := v_is_admin_shop;

  IF v_is_admin_shop THEN
    NEW.admin_commission_5pct := NEW.total_price;  -- platform keeps 100%
    NEW.vendor_amount_95pct   := 0;
  ELSE
    NEW.admin_commission_5pct := ROUND(NEW.total_price * 0.05, 2); -- 5% cut
    NEW.vendor_amount_95pct   := ROUND(NEW.total_price * 0.95, 2); -- 95% net
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_split_commission ON public.order_items;
CREATE TRIGGER trg_split_commission
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.split_commission();

-- Keep orders.platform_fee_total in sync with its items
CREATE OR REPLACE FUNCTION public.sync_platform_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders o
  SET platform_fee_total = (
    SELECT COALESCE(SUM(
      CASE WHEN i.is_admin_shop THEN i.total_price ELSE i.admin_commission_5pct END
    ), 0)
    FROM public.order_items i WHERE i.order_id = o.id
  )
  WHERE o.id = NEW.order_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_platform_fee ON public.order_items;
CREATE TRIGGER trg_sync_platform_fee
  AFTER INSERT OR UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_platform_fee();

-- When an order becomes PAID → credit every affected vendor wallet (+95%)
CREATE OR REPLACE FUNCTION public.credit_vendor_wallets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status <> 'paid' THEN
    INSERT INTO public.vendor_wallets (shop_id, total_earnings_95pct, current_balance)
    SELECT i.shop_id, SUM(i.vendor_amount_95pct), SUM(i.vendor_amount_95pct)
    FROM public.order_items i
    WHERE i.order_id = NEW.id AND i.shop_id IS NOT NULL AND i.is_admin_shop = FALSE
    GROUP BY i.shop_id
    ON CONFLICT (shop_id) DO UPDATE SET
      total_earnings_95pct = vendor_wallets.total_earnings_95pct + EXCLUDED.total_earnings_95pct,
      current_balance      = vendor_wallets.current_balance      + EXCLUDED.current_balance,
      updated_at           = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_credit_wallets ON public.orders;
CREATE TRIGGER trg_credit_wallets
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.credit_vendor_wallets();

-- Deduct wallet balance when admin marks a payout as transferred
CREATE OR REPLACE FUNCTION public.settle_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'transferred' AND OLD.status <> 'transferred' THEN
    UPDATE public.vendor_wallets SET
      total_withdrawn = total_withdrawn + NEW.amount,
      updated_at = NOW()
    WHERE shop_id = NEW.shop_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_settle_payout ON public.payout_requests;
CREATE TRIGGER trg_settle_payout
  AFTER UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.settle_payout();

-- Keep product rating aggregates fresh
CREATE OR REPLACE FUNCTION public.refresh_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_pid UUID := COALESCE(NEW.product_id, OLD.product_id);
BEGIN
  UPDATE public.products p SET
    rating        = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.reviews r WHERE r.product_id = v_pid), 5.00),
    reviews_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.product_id = v_pid)
  WHERE p.id = v_pid;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_rating ON public.reviews;
CREATE TRIGGER trg_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();

-- ============================================================================
-- SECTION 5: ENABLE ROW LEVEL SECURITY + POLICIES
-- ============================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_wallets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;

-- ---------------------------- PROFILES --------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_basic" ON public.profiles;
CREATE POLICY "profiles_update_own_basic" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- SECURITY: RLS is row-level only — the policy above would still let a user
-- set their own role='admin'. This trigger locks protected columns unless an
-- admin (or SQL-editor/service-role maintenance, where auth.uid() IS NULL)
-- performs the change. See supabase-security-patch-001.sql for full docs.
CREATE OR REPLACE FUNCTION public.guard_profile_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- maintenance context (first-admin bootstrap etc.)
  END IF;
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Permission denied: role cannot be changed by users.';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Permission denied: email cannot be changed here.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_privileges ON public.profiles;
CREATE TRIGGER trg_guard_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileges();

-- Append-only audit trail for sensitive admin actions.
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  details     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read_only" ON public.admin_audit_logs;
CREATE POLICY "audit_admin_read_only" ON public.admin_audit_logs
  FOR SELECT USING (public.is_admin());

-- No INSERT/UPDATE/DELETE policies on purpose: writes go through definer code.

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action      TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id   TEXT DEFAULT NULL,
  p_details     JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can write audit entries.';
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, details)
    VALUES (
      CASE WHEN public.is_admin() AND auth.uid() IS NOT NULL THEN auth.uid() ELSE NULL END,
      'profile.role_changed',
      'profile',
      NEW.id::TEXT,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role,
                         'via', CASE WHEN auth.uid() IS NULL THEN 'sql_editor/service_role' ELSE 'app' END)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_profile_role ON public.profiles;
CREATE TRIGGER trg_audit_profile_role
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_role_change();

-- ------------------------------ SHOPS ---------------------------------------
DROP POLICY IF EXISTS "shops_public_read_active" ON public.shops;
CREATE POLICY "shops_public_read_active" ON public.shops
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "shops_read_own_or_admin" ON public.shops;
CREATE POLICY "shops_read_own_or_admin" ON public.shops
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "shops_authenticated_create" ON public.shops;
CREATE POLICY "shops_authenticated_create" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND is_admin_shop = FALSE);

DROP POLICY IF EXISTS "shops_owner_update" ON public.shops;
CREATE POLICY "shops_owner_update" ON public.shops
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND is_admin_shop = (SELECT s.is_admin_shop FROM public.shops s WHERE s.id = shops.id)
    AND is_verified   = (SELECT s.is_verified   FROM public.shops s WHERE s.id = shops.id)
  );

DROP POLICY IF EXISTS "shops_admin_update" ON public.shops;
CREATE POLICY "shops_admin_update" ON public.shops
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "shops_admin_delete" ON public.shops;
CREATE POLICY "shops_admin_delete" ON public.shops
  FOR DELETE USING (public.is_admin());

-- ----------------------------- PRODUCTS -------------------------------------
DROP POLICY IF EXISTS "products_public_read_active" ON public.products;
CREATE POLICY "products_public_read_active" ON public.products
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "products_read_own_or_admin" ON public.products;
CREATE POLICY "products_read_own_or_admin" ON public.products
  FOR SELECT USING (public.owns_shop(shop_id) OR public.is_admin());

DROP POLICY IF EXISTS "products_vendor_insert" ON public.products;
CREATE POLICY "products_vendor_insert" ON public.products
  FOR INSERT WITH CHECK (public.owns_shop(shop_id));

DROP POLICY IF EXISTS "products_vendor_update" ON public.products;
CREATE POLICY "products_vendor_update" ON public.products
  FOR UPDATE USING (public.owns_shop(shop_id))
  WITH CHECK (public.owns_shop(shop_id));

DROP POLICY IF EXISTS "products_vendor_delete" ON public.products;
CREATE POLICY "products_vendor_delete" ON public.products
  FOR DELETE USING (public.owns_shop(shop_id));

DROP POLICY IF EXISTS "products_admin_full" ON public.products;
CREATE POLICY "products_admin_full" ON public.products
  FOR ALL USING (public.is_admin());

-- ------------------------------ ORDERS --------------------------------------
DROP POLICY IF EXISTS "orders_customer_insert" ON public.orders;
CREATE POLICY "orders_customer_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "orders_customer_read" ON public.orders;
CREATE POLICY "orders_customer_read" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "orders_vendor_read" ON public.orders;
CREATE POLICY "orders_vendor_read" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.order_items i
      JOIN public.shops s ON s.id = i.shop_id
      WHERE i.order_id = orders.id AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders_admin_read" ON public.orders;
CREATE POLICY "orders_admin_read" ON public.orders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "orders_customer_cancel" ON public.orders;
CREATE POLICY "orders_customer_cancel" ON public.orders
  FOR UPDATE USING (
    auth.uid() = customer_id
    AND payment_status = 'pending'
    AND overall_status IN ('pending','processing')
  );

-- ---------------------------- ORDER ITEMS -----------------------------------
DROP POLICY IF EXISTS "items_insert_with_own_order" ON public.order_items;
CREATE POLICY "items_insert_with_own_order" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "items_read_if_order_visible" ON public.order_items;
CREATE POLICY "items_read_if_order_visible" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.order_items i
      JOIN public.shops s ON s.id = i.shop_id
      WHERE i.order_id = order_items.order_id AND s.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "items_vendor_update_status" ON public.order_items;
CREATE POLICY "items_vendor_update_status" ON public.order_items
  FOR UPDATE USING (public.owns_shop(shop_id))
  WITH CHECK (public.owns_shop(shop_id));

DROP POLICY IF EXISTS "items_admin_all" ON public.order_items;
CREATE POLICY "items_admin_all" ON public.order_items
  FOR ALL USING (public.is_admin());

-- ---------------------------- VENDOR WALLETS --------------------------------
DROP POLICY IF EXISTS "wallets_owner_read" ON public.vendor_wallets;
CREATE POLICY "wallets_owner_read" ON public.vendor_wallets
  FOR SELECT USING (public.owns_shop(shop_id));

DROP POLICY IF EXISTS "wallets_admin_read" ON public.vendor_wallets;
CREATE POLICY "wallets_admin_read" ON public.vendor_wallets
  FOR SELECT USING (public.is_admin());

-- Wallet rows are written ONLY by the SECURITY DEFINER triggers above.

-- ---------------------------- PAYOUT REQUESTS -------------------------------
DROP POLICY IF EXISTS "payouts_owner_insert" ON public.payout_requests;
CREATE POLICY "payouts_owner_insert" ON public.payout_requests
  FOR INSERT WITH CHECK (
    public.owns_shop(shop_id)
    AND amount <= (
      SELECT w.current_balance FROM public.vendor_wallets w WHERE w.shop_id = payout_requests.shop_id
    )
  );

DROP POLICY IF EXISTS "payouts_owner_read" ON public.payout_requests;
CREATE POLICY "payouts_owner_read" ON public.payout_requests
  FOR SELECT USING (public.owns_shop(shop_id));

DROP POLICY IF EXISTS "payouts_admin_read" ON public.payout_requests;
CREATE POLICY "payouts_admin_read" ON public.payout_requests
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "payouts_admin_update" ON public.payout_requests;
CREATE POLICY "payouts_admin_update" ON public.payout_requests
  FOR UPDATE USING (public.is_admin());

-- ------------------------------- REVIEWS ------------------------------------
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "reviews_verified_purchase_insert" ON public.reviews;
CREATE POLICY "reviews_verified_purchase_insert" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.order_items i
      JOIN public.orders o ON o.id = i.order_id
      WHERE i.product_id = reviews.product_id
        AND o.customer_id = auth.uid()
        AND o.payment_status = 'paid'
    )
  );

DROP POLICY IF EXISTS "reviews_author_update" ON public.reviews;
CREATE POLICY "reviews_author_update" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_author_delete" ON public.reviews;
CREATE POLICY "reviews_author_delete" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- SECTION 6: STORAGE BUCKET (shop logos, banners, product photos)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_authenticated_upload" ON storage.objects;
CREATE POLICY "media_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "media_owner_manage" ON storage.objects;
CREATE POLICY "media_owner_manage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- SECTION 7: DASHBOARD VIEWS
-- ============================================================================

-- Super Admin earnings snapshot: flagship revenue + 5% commission
CREATE OR REPLACE VIEW public.admin_earnings_summary AS
SELECT
  COALESCE(SUM(CASE WHEN i.is_admin_shop THEN i.total_price ELSE i.admin_commission_5pct END), 0) AS total_platform_earnings,
  COALESCE(SUM(CASE WHEN i.is_admin_shop THEN i.total_price ELSE 0 END), 0)                       AS flagship_store_revenue,
  COALESCE(SUM(CASE WHEN NOT i.is_admin_shop THEN i.admin_commission_5pct ELSE 0 END), 0)         AS commission_income_5pct
FROM public.order_items i
JOIN public.orders o ON o.id = i.order_id
WHERE o.payment_status = 'paid';

-- Per-vendor financial summary
CREATE OR REPLACE VIEW public.vendor_financial_summary AS
SELECT
  s.id                                      AS shop_id,
  s.name                                    AS shop_name,
  COALESCE(SUM(i.total_price), 0)           AS gross_sales,
  COALESCE(SUM(i.admin_commission_5pct), 0) AS commission_paid_5pct,
  COALESCE(SUM(i.vendor_amount_95pct), 0)   AS net_earnings_95pct
FROM public.shops s
LEFT JOIN public.order_items i ON i.shop_id = s.id
LEFT JOIN public.orders o ON o.id = i.order_id AND o.payment_status = 'paid'
WHERE s.is_admin_shop = FALSE
GROUP BY s.id, s.name;

-- ============================================================================
-- DONE! 🎉
-- Next steps:
--   • Sign up inside the app → profile is created automatically
--   • Make YOUR account Super Admin:
--       UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
--   • Create your flagship store from the Admin Panel (is_admin_shop = TRUE).
-- ============================================================================
