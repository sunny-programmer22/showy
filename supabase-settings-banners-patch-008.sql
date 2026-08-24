-- ============================================================
-- SHOWY PATCH 008: Banners (admin-managed hero posters) + Wishlist + Profile settings
-- Safe to re-run.
-- ============================================================

-- 1) Hero banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  headline TEXT NOT NULL DEFAULT '',
  sub TEXT DEFAULT '',
  link TEXT DEFAULT '',
  sort INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='banners_public_read') THEN
    CREATE POLICY banners_public_read ON public.banners FOR SELECT USING (is_active = TRUE OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='banners_admin_write') THEN
    CREATE POLICY banners_admin_write ON public.banners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 2) Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wishlist' AND policyname='wishlist_own') THEN
    CREATE POLICY wishlist_own ON public.wishlist FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Profile settings columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_address JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prefs JSONB DEFAULT '{}'::jsonb;
