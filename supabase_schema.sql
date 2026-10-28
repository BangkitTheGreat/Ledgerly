-- =============================================
-- supabase_schema.sql — skema LENGKAP Ledgerly
-- Jalankan sekali di project Supabase baru: Dashboard > SQL Editor > paste semua > Run.
-- Aman dijalankan ulang (pakai IF NOT EXISTS / OR REPLACE).
-- =============================================

-- ---------- TABEL ----------

CREATE TABLE IF NOT EXISTS "Users" (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            text UNIQUE NOT NULL,
  nama             text,
  bisnis           text,
  role             text NOT NULL DEFAULT 'pemilik',   -- 'pemilik' | 'superadmin'
  "noTelp"         bigint CONSTRAINT users_notelp_key UNIQUE, -- identitas bot WA, gak boleh dobel
  paket            text NOT NULL DEFAULT 'starter'
                   CHECK (paket IN ('starter', 'business', 'enterprise')),
  tgl_expired      timestamptz,
  status_langganan text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Kategori" (
  kategori_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori text NOT NULL,
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Products" (
  product_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "SKU"         text,
  nama_product  text NOT NULL,
  kategori_id   uuid REFERENCES "Kategori"(kategori_id) ON DELETE SET NULL,
  current_stok  integer NOT NULL DEFAULT 0,
  min_stok      integer NOT NULL DEFAULT 0,
  max_stok      integer,
  modal         bigint NOT NULL DEFAULT 0,  -- harga beli
  harga         bigint NOT NULL DEFAULT 0,  -- harga jual
  supplier_nama text,
  supplier_wa   text,
  barcode       text,
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Metode" (
  metode_id         uuid PRIMARY KEY,
  metode_pembayaran text NOT NULL
);

CREATE TABLE IF NOT EXISTS "Transactions" (
  transaction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "isPenjualan"  boolean NOT NULL DEFAULT true,
  user_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  metode_id      uuid REFERENCES "Metode"(metode_id),
  catatan        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Detail_Transactions" (
  detail_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id      uuid NOT NULL REFERENCES "Transactions"(transaction_id) ON DELETE CASCADE,
  -- SET NULL: produk dihapus, history tetap utuh lewat kolom snapshot
  product_id          uuid REFERENCES "Products"(product_id) ON DELETE SET NULL,
  jumlah              integer NOT NULL,
  nama_snapshot       text,
  harga_beli_snapshot bigint,
  harga_jual_snapshot bigint,
  user_id             uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Pengumuman" (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul      text NOT NULL,
  isi        text,
  is_aktif   boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Platform_Settings" (
  key   text PRIMARY KEY,
  value text
);

-- ---------- SEED ----------
-- UUID metode di-hardcode di js/app.js & js/komponen/upload.js, jadi HARUS sama persis.
INSERT INTO "Metode" (metode_id, metode_pembayaran) VALUES
  ('b1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Cash'),
  ('b2b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Transfer'),
  ('b3b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'QRIS')
ON CONFLICT (metode_id) DO NOTHING;

-- ---------- HELPER ----------
-- SECURITY DEFINER biar policy bisa cek role tanpa rekursi RLS di tabel Users.
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM "Users" WHERE user_id = auth.uid() AND role = 'superadmin');
$$;

-- ---------- TRIGGER: profil otomatis saat signUp ----------
-- register.js kirim nama/bisnis/noTelp/paket di options.data -> raw_user_meta_data.
-- Skip kalau dibuat admin (/api/create-user insert profil sendiri) atau login Google
-- tanpa metadata (gate cekKembaliOAuth harus tetap nolak email yg belum daftar).
-- paket dr metadata itu input user: cuma 'business' yg dihormati & selalu jadi
-- trial 7 hari dr server. enterprise/nilai lain -> starter (enterprise dikasih admin).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  m jsonb := NEW.raw_user_meta_data;
  trial boolean := (m->>'paket') = 'business';
  tel bigint := NULLIF(m->>'noTelp', '')::bigint;
BEGIN
  IF m->>'created_by' = 'admin' OR m->>'nama' IS NULL THEN
    RETURN NEW;
  END IF;
  -- nomor yg udah dipakai org lain dikosongin (biar profil tetap kebikin)
  IF EXISTS (SELECT 1 FROM "Users" WHERE "noTelp" = tel) THEN tel := NULL; END IF;
  INSERT INTO "Users" (user_id, email, nama, bisnis, "noTelp", paket, tgl_expired, status_langganan, role)
  VALUES (NEW.id, NEW.email, m->>'nama', m->>'bisnis', tel,
          CASE WHEN trial THEN 'business' ELSE 'starter' END,
          CASE WHEN trial THEN now() + interval '7 days' END,
          CASE WHEN trial THEN 'trial' END,
          'pemilik')
  ON CONFLICT DO NOTHING; -- jangan pernah gagalin signUp
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- TRIGGER: cegah pemilik naikin role/paket sendiri ----------
-- Pemilik boleh update profil sendiri (nama, bisnis, noTelp) & auto-downgrade ke starter,
-- tapi gak boleh jadi superadmin / upgrade paket / ganti email lewat console browser.
-- (email = kunci lookup profil; kalau bisa diganti, pemilik bisa "nyerobot" email org lain)
CREATE OR REPLACE FUNCTION public.guard_users_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_superadmin() THEN
    RETURN NEW; -- service_role / SQL editor / superadmin bebas
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.email IS DISTINCT FROM OLD.email
     OR (NEW.paket IS DISTINCT FROM OLD.paket AND NEW.paket <> 'starter')
     OR (NEW.tgl_expired IS DISTINCT FROM OLD.tgl_expired AND NEW.tgl_expired IS NOT NULL) THEN
    RAISE EXCEPTION 'Tidak diizinkan mengubah role/paket/email';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_users_update ON "Users";
CREATE TRIGGER trg_guard_users_update
BEFORE UPDATE ON "Users"
FOR EACH ROW EXECUTE FUNCTION public.guard_users_update();

-- ---------- PAKET EFEKTIF (dipakai trigger & kuota; gak dibuka ke client) ----------
-- business yg expired / tanpa tgl_expired dihitung starter. superadmin = tanpa batas.
CREATE OR REPLACE FUNCTION public.paket_efektif(uid uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT CASE
      WHEN role = 'superadmin' THEN 'enterprise'
      WHEN paket = 'business' AND (tgl_expired IS NULL OR tgl_expired < now()) THEN 'starter'
      ELSE paket END
    FROM "Users" WHERE user_id = uid), 'starter');
$$;

-- ---------- KUOTA CHATBOT (server-side) ----------
-- api/chatbot.js manggil rpc ini pake JWT user sblm nembak Gemini.
CREATE TABLE IF NOT EXISTS "Chat_Usage" (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hari    date NOT NULL,
  jumlah  int  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, hari)
);

CREATE OR REPLACE FUNCTION public.pakai_kuota_chat()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); n int;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF public.paket_efektif(uid) <> 'starter' THEN RETURN true; END IF;
  INSERT INTO "Chat_Usage" (user_id, hari, jumlah)
  VALUES (uid, (now() AT TIME ZONE 'Asia/Jakarta')::date, 1)
  ON CONFLICT (user_id, hari) DO UPDATE SET jumlah = "Chat_Usage".jumlah + 1
  RETURNING jumlah INTO n;
  RETURN n <= 10; -- starter: 10 kueri/hari (WIB)
END;
$$;

-- ---------- BATAS 50 PRODUK STARTER ----------
CREATE OR REPLACE FUNCTION public.batas_produk_starter()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.paket_efektif(NEW.user_id) = 'starter'
     AND (SELECT count(*) FROM "Products" WHERE user_id = NEW.user_id) >= 50 THEN
    RAISE EXCEPTION 'Batas 50 produk paket Starter tercapai' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_batas_produk_starter ON "Products";
CREATE TRIGGER trg_batas_produk_starter
BEFORE INSERT ON "Products"
FOR EACH ROW EXECUTE FUNCTION public.batas_produk_starter();

-- ---------- HAPUS PEMILIK = HAPUS AKUN AUTH ----------
-- superadmin hapus baris Users -> akun auth (sandi, sesi) ikut dihapus, data toko
-- ikut cascade dr auth.users. cuma jalan kalau yg hapus superadmin (bukan cascade
-- dr service_role/admin api yg udah hapus auth duluan).
CREATE OR REPLACE FUNCTION public.hapus_auth_pemilik()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_superadmin() AND OLD.role <> 'superadmin' THEN
    DELETE FROM auth.users WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_hapus_auth_pemilik ON "Users";
CREATE TRIGGER trg_hapus_auth_pemilik
AFTER DELETE ON "Users"
FOR EACH ROW EXECUTE FUNCTION public.hapus_auth_pemilik();

-- ---------- GRANTS ----------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON "Platform_Settings" TO anon; -- register.js baca wa_admin sebelum login
-- api/create-user, api/delete-orphan & bot WA pakai service_role (project baru gak auto-grant)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- fungsi trigger gak perlu bisa dipanggil via /rest/v1/rpc; is_superadmin dipakai policy -> authenticated aja
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_users_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.paket_efektif(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.batas_produk_starter() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hapus_auth_pemilik() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pakai_kuota_chat() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pakai_kuota_chat() TO authenticated;
-- Chat_Usage cuma lewat pakai_kuota_chat (RLS on, tanpa policy, tanpa grant)
REVOKE ALL ON "Chat_Usage" FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

-- ---------- RLS ----------
ALTER TABLE "Users"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Kategori"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Products"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Metode"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transactions"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Detail_Transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pengumuman"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Platform_Settings"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat_Usage"          ENABLE ROW LEVEL SECURITY;

-- Users: baca/ubah profil sendiri; superadmin kelola semua
DROP POLICY IF EXISTS users_select ON "Users";
DROP POLICY IF EXISTS users_insert ON "Users";
DROP POLICY IF EXISTS users_update ON "Users";
DROP POLICY IF EXISTS users_delete ON "Users";
CREATE POLICY users_select ON "Users" FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR email = auth.jwt()->>'email' OR public.is_superadmin());
-- insert dr client cuma boleh profil starter polos; paket/trial diatur trigger/superadmin
CREATE POLICY users_insert ON "Users" FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid() AND role = 'pemilik' AND paket = 'starter'
               AND tgl_expired IS NULL AND status_langganan IS NULL)
              OR public.is_superadmin());
CREATE POLICY users_update ON "Users" FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());
CREATE POLICY users_delete ON "Users" FOR DELETE TO authenticated
  USING (public.is_superadmin());

-- Data milik pemilik: cuma punya sendiri; superadmin boleh baca semua (statistik dasbor)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['Kategori','Products','Transactions','Detail_Transactions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS own_rows ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS admin_read ON %I', t);
    EXECUTE format('CREATE POLICY own_rows ON %I FOR ALL TO authenticated
                    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())', t);
    EXECUTE format('CREATE POLICY admin_read ON %I FOR SELECT TO authenticated
                    USING (public.is_superadmin())', t);
  END LOOP;
END $$;

-- Metode: semua user login boleh baca
DROP POLICY IF EXISTS metode_read ON "Metode";
CREATE POLICY metode_read ON "Metode" FOR SELECT TO authenticated USING (true);

-- Pengumuman: semua user login baca; superadmin tulis
DROP POLICY IF EXISTS peng_read ON "Pengumuman";
DROP POLICY IF EXISTS peng_write ON "Pengumuman";
CREATE POLICY peng_read ON "Pengumuman" FOR SELECT TO authenticated USING (true);
CREATE POLICY peng_write ON "Pengumuman" FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- Platform_Settings: publik baca; superadmin tulis (bot WA pakai service_role, bypass RLS)
DROP POLICY IF EXISTS ps_read ON "Platform_Settings";
DROP POLICY IF EXISTS ps_write ON "Platform_Settings";
CREATE POLICY ps_read ON "Platform_Settings" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ps_write ON "Platform_Settings" FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- =============================================
-- SETELAH RUN: daftar akun via register.html, lalu jadikan superadmin:
--   UPDATE "Users" SET role = 'superadmin' WHERE email = 'email-kamu@gmail.com';
-- =============================================
