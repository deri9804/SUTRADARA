-- =====================================================================
-- TRENDORA AI - SUPABASE ROW LEVEL SECURITY (RLS) HARDENING
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. Buat Helper Function untuk Verifikasi Admin (Anti-Recursion Security Definer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- 2. TABEL: PROFILES
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan SELECT: User hanya bisa baca profil sendiri, admin bisa baca semua
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
);

-- Kebijakan SELECT untuk Webhook WhatsApp Vercel (Memverifikasi nomor member yang aktif)
DROP POLICY IF EXISTS "profiles_webhook_verify_policy" ON public.profiles;
CREATE POLICY "profiles_webhook_verify_policy" ON public.profiles
FOR SELECT TO anon
USING (status = 'active');

-- Kebijakan UPDATE: User hanya bisa edit data sendiri dan TIDAK BISA naikkan role ke admin
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
)
WITH CHECK (
  public.is_admin() OR (
    auth.uid() = id AND
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
    status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- Kebijakan INSERT: Hanya bisa insert profil untuk diri sendiri saat signup / admin
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id OR public.is_admin()
);

-- ---------------------------------------------------------------------
-- 3. TABEL: MEMBER_DEVICES (Pencegahan Bypass Device Limit)
-- ---------------------------------------------------------------------
ALTER TABLE public.member_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_devices_policy" ON public.member_devices;
CREATE POLICY "member_devices_policy" ON public.member_devices
FOR ALL TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ---------------------------------------------------------------------
-- 4. TABEL: MEMBER_SETTINGS
-- ---------------------------------------------------------------------
ALTER TABLE public.member_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_settings_policy" ON public.member_settings;
CREATE POLICY "member_settings_policy" ON public.member_settings
FOR ALL TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ---------------------------------------------------------------------
-- 5. TABEL: WA_STORYBOARDS (Riwayat Konsep Video dari WhatsApp Bot)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wa_storyboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT,
    sender_name TEXT,
    prompt TEXT,
    result TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wa_storyboards ENABLE ROW LEVEL SECURITY;

-- Kebijakan SELECT: User dapat membaca riwayat miliknya, admin bisa membaca semua
DROP POLICY IF EXISTS "wa_storyboards_select_policy" ON public.wa_storyboards;
CREATE POLICY "wa_storyboards_select_policy" ON public.wa_storyboards
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Kebijakan INSERT: Mengizinkan Webhook Vercel (anon/service_role) & Authenticated menyimpan riwayat
DROP POLICY IF EXISTS "wa_storyboards_insert_policy" ON public.wa_storyboards;
CREATE POLICY "wa_storyboards_insert_policy" ON public.wa_storyboards
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Kebijakan DELETE: User & Admin bisa menghapus riwayat
DROP POLICY IF EXISTS "wa_storyboards_delete_policy" ON public.wa_storyboards;
CREATE POLICY "wa_storyboards_delete_policy" ON public.wa_storyboards
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

