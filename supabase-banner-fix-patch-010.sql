-- ============================================================
-- SHOWY PATCH 010: Fix Hero Banners RLS — unblock admin upload
-- Run in Supabase Dashboard > SQL Editor > New query > paste > RUN
-- Safe to re-run. Fixes "new row violates row-level security policy"
-- ============================================================

-- 1) Make sure your account has admin role (uses the shop owner id and common admin email)
UPDATE public.profiles SET role = 'admin'
WHERE id = '65bfb6ac-f6d0-459f-ad52-b962db6e5505'
   OR email = 'siddiknurealam1@gmail.com'
   OR email = (SELECT email FROM auth.users WHERE id = '65bfb6ac-f6d0-459f-ad52-b962db6e5505');

-- 2) Ensure banners table exists (from patch 008)
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

-- 3) Replace policies with a robust admin check (role = 'admin')
DROP POLICY IF EXISTS banners_public_read ON public.banners;
DROP POLICY IF EXISTS banners_admin_write ON public.banners;

CREATE POLICY banners_public_read ON public.banners
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY banners_admin_write ON public.banners
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4) Verify (run these SELECTs after — they should return your admin row)
-- SELECT id, email, role FROM public.profiles WHERE id = '65bfb6ac-f6d0-459f-ad52-b962db6e5505';
-- SELECT public.is_admin(); -- should return true when run as your admin user via app, not in SQL Editor
-- SELECT * FROM public.banners LIMIT 1;
