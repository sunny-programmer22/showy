-- ============================================================
-- SHOWY PATCH 011: Fix banner image upload (storage RLS)
-- Run in Supabase Dashboard > SQL Editor > New query > paste > RUN
-- Fixes "new row violates row-level security policy" when uploading
-- banner image in Admin Panel → Hero Banners → Upload Image
-- ============================================================

-- 1) Ensure your account is admin (covers the banner table RLS too)
UPDATE public.profiles SET role = 'admin'
WHERE id = '65bfb6ac-f6d0-459f-ad52-b962db6e5505'
   OR email = 'siddiknurealam1@gmail.com'
   OR email ILIKE '%admin%';

-- 2) Allow admin to upload anywhere in the media bucket (needed for banners/...)
-- The default policy only allows uploads to <uid>/... paths.
-- This extra policy lets admins upload to banners/... and any other path.
DROP POLICY IF EXISTS "media_admin_any" ON storage.objects;
CREATE POLICY "media_admin_any" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND public.is_admin()
  );

DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND public.is_admin());

-- 3) Re-confirm banners table policies (from patch 010) in case 010 wasn't run
DROP POLICY IF EXISTS banners_public_read ON public.banners;
DROP POLICY IF EXISTS banners_admin_write ON public.banners;
CREATE POLICY banners_public_read ON public.banners
  FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY banners_admin_write ON public.banners
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
