-- ====================================================================
-- CNC DATABASE - SUPABASE POSTGRESQL SCHEMA (100% FREE TIER READY)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'operator', 'mandor', 'user')),
    department TEXT,
    password_hash TEXT NOT NULL DEFAULT '123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLATES TABLE (MASTER PLAT YARD & REMNANT)
CREATE TABLE IF NOT EXISTS plates (
    id BIGSERIAL PRIMARY KEY,
    no_plat TEXT UNIQUE NOT NULL,
    heat_number TEXT NOT NULL,
    grade TEXT NOT NULL,
    material_type TEXT NOT NULL, -- Baja, Aluminium, Stainless
    panjang_mm INTEGER NOT NULL,
    lebar_mm INTEGER NOT NULL,
    tebal_mm NUMERIC(8, 2) NOT NULL,
    berat_kg NUMERIC(10, 2) NOT NULL,
    stok INTEGER NOT NULL DEFAULT 1,
    no_sertifikat_class TEXT DEFAULT 'Mill Test',
    lokasi_yard TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Tersedia', -- Tersedia, Dipesan, Diambil, Sudah Dipotong, Sisa Potongan / Remnant
    is_remnant BOOLEAN NOT NULL DEFAULT FALSE,
    parent_plate_id BIGINT REFERENCES plates(id) ON DELETE SET NULL,
    order_id_pemakai TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE (ORDER PEMOTONGAN PLAT CNC)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    no_order TEXT UNIQUE NOT NULL,
    jenis_pekerjaan TEXT NOT NULL,
    jenis_pekerjaan_kategori TEXT NOT NULL,
    deskripsi_pekerjaan TEXT NOT NULL,
    nama_pemesan TEXT NOT NULL,
    departemen_pemesan TEXT NOT NULL,
    nik_pemesan TEXT,
    no_hp_pemesan TEXT NOT NULL,
    nama_proyek TEXT NOT NULL,
    nama_proyek_kapal TEXT DEFAULT '-',
    material TEXT NOT NULL,
    ketebalan TEXT NOT NULL,
    jumlah_pesanan INTEGER NOT NULL,
    satuan TEXT NOT NULL DEFAULT 'pcs',
    ukuran_part TEXT DEFAULT '-',
    waktu_pengambilan_diinginkan TEXT NOT NULL,
    deadline_pekerjaan DATE,
    catatan_pekerjaan TEXT,
    drawing_file_name TEXT,
    drawing_data_url TEXT,
    target_cnc TEXT NOT NULL, -- Group CNC 1, Group CNC 2, Group CNC 3
    status TEXT NOT NULL DEFAULT 'Menunggu Estimasi',
    plate_id BIGINT REFERENCES plates(id) ON DELETE SET NULL,
    plat_dipakai TEXT,
    kode_pengambilan VARCHAR(6),
    waktu_mulai TIMESTAMPTZ,
    waktu_selesai TIMESTAMPTZ,
    waktu_diambil TIMESTAMPTZ,
    pengambil_akhir TEXT,
    departemen_pengambil TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER ESTIMATIONS TABLE (NESTING & CUTTING PLAN SHEET)
CREATE TABLE IF NOT EXISTS order_estimations (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    project_name TEXT,
    nesting_no TEXT,
    block_item TEXT,
    spec_material TEXT,
    dimension_material TEXT,
    product_number TEXT,
    heat_number TEXT,
    status_approval TEXT NOT NULL DEFAULT 'Menunggu Persetujuan',
    grade TEXT,
    tebal TEXT,
    ukuran_plat TEXT,
    lembar INTEGER DEFAULT 1,
    berat_kg NUMERIC(10, 2) DEFAULT 0,
    jam NUMERIC(8, 1) DEFAULT 0,
    remnant TEXT,
    tgl_selesai DATE DEFAULT CURRENT_DATE,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kolom tambahan & migrasi constraint untuk database Supabase yang sudah berjalan:
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'operator', 'mandor', 'user'));
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS nesting_no TEXT;
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS block_item TEXT;
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS spec_material TEXT;
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS dimension_material TEXT;
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS product_number TEXT;
ALTER TABLE order_estimations ADD COLUMN IF NOT EXISTS heat_number TEXT;

-- 6. YARD PICKUPS TABLE
CREATE TABLE IF NOT EXISTS yard_pickups (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    plate_id BIGINT NOT NULL REFERENCES plates(id) ON DELETE CASCADE,
    jumlah_ambil INTEGER NOT NULL DEFAULT 1,
    sisa_stok INTEGER,
    keperluan TEXT,
    remnant_plate_id BIGINT REFERENCES plates(id) ON DELETE SET NULL,
    pengambil TEXT NOT NULL,
    petugas_yard TEXT NOT NULL,
    is_partial BOOLEAN NOT NULL DEFAULT FALSE,
    sisa_p INTEGER,
    sisa_l INTEGER,
    picked_up_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plates ADD COLUMN IF NOT EXISTS stok INTEGER NOT NULL DEFAULT 1;
ALTER TABLE yard_pickups ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE yard_pickups ADD COLUMN IF NOT EXISTS jumlah_ambil INTEGER NOT NULL DEFAULT 1;
ALTER TABLE yard_pickups ADD COLUMN IF NOT EXISTS sisa_stok INTEGER;
ALTER TABLE yard_pickups ADD COLUMN IF NOT EXISTS keperluan TEXT;

-- 7. ENABLE ROW LEVEL SECURITY (RLS) & OPEN POLICIES FOR ANON
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE yard_pickups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete profiles" ON profiles FOR DELETE USING (true);

CREATE POLICY "Allow public read plates" ON plates FOR SELECT USING (true);
CREATE POLICY "Allow public insert plates" ON plates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update plates" ON plates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete plates" ON plates FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON orders FOR DELETE USING (true);

CREATE POLICY "Allow public read order_estimations" ON order_estimations FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_estimations" ON order_estimations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_estimations" ON order_estimations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete order_estimations" ON order_estimations FOR DELETE USING (true);

CREATE POLICY "Allow public read yard_pickups" ON yard_pickups FOR SELECT USING (true);
CREATE POLICY "Allow public insert yard_pickups" ON yard_pickups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update yard_pickups" ON yard_pickups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete yard_pickups" ON yard_pickups FOR DELETE USING (true);

-- 8. DEFAULT SEED USERS (ADMIN, MANDOR, USER)
INSERT INTO profiles (name, username, email, role, department, password_hash)
VALUES
    ('Administrator CNC', 'admin', 'admin@gmail.com', 'admin', 'Supervisor', '123'),
    ('Operator CNC', 'Operator', 'Operator@gmail.com', 'mandor', 'Produksi CNC', '123'),
    ('User (Pemesan / Viewer)', 'user', 'user@gmail.com', 'user', 'Hull Construction', '123')
ON CONFLICT (username) DO NOTHING;

