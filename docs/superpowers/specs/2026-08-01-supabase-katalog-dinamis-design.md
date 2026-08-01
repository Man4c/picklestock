# Supabase — Sub-proyek #1: Katalog Dinamis (Baca)

**Tanggal:** 2026-08-01
**Status:** Disetujui (keputusan desain ditetapkan pengguna)
**Bagian dari:** Integrasi Supabase (3 sub-proyek berurutan)

## Konteks & pemecahan

Integrasi Supabase penuh dipecah jadi tiga sub-proyek berurutan, masing-masing
dengan spec → plan → implementasi sendiri:

| # | Sub-proyek | Bergantung pada |
|---|---|---|
| **1** | **Katalog dinamis (baca)** — spec ini | — |
| 2 | Auth admin (login/logout + proteksi `/admin`) | #1 |
| 3 | CRUD + storage gambar + stok→status | #1, #2 |

Spec ini hanya mencakup **#1**: mengganti sumber data statis `lib/products.ts`
dengan query baca dari Supabase. Belum ada auth, mutasi, atau upload.

## Masalah

Semua data produk statis di `lib/products.ts` (array 6 produk hardcoded).
Katalog publik, halaman detail, dan tabel admin membacanya secara sinkron.
PRD §3 mensyaratkan Supabase (PostgreSQL) sebagai sumber data.

## Prinsip pemandu

AGENTS.md: *"Data produk berasal dari `lib/products.ts`. Saat Supabase masuk,
file itulah satu-satunya yang perlu diganti — komponen tampilan tidak menyentuh
sumber data."* Desain ini menghormatinya: **signature publik tetap** —
`getAllProducts()` dan `getProductBySlug()` — hanya isinya berubah dari array
statis menjadi query Supabase. Konsekuensinya keduanya menjadi `async`, sehingga
komponen pemanggil (sudah server components) tinggal `await`.

## Keputusan desain (ditetapkan pengguna)

1. **Backend:** Supabase (akun baru — dipandu saat implementasi).
2. **`specs`:** disimpan sebagai kolom **JSONB** (bukan 5 kolom terpisah),
   mencerminkan `Product.specs` yang memang objek bersarang.
3. **Pola akses:** query langsung di server component (bukan route handler /
   client fetch) — dikonfirmasi docs Next 16 (`getting-started/06-fetching-data`).
4. **Filter tetap di klien:** `lib/filter.ts` tak berubah; DB mengembalikan semua
   produk, penyaringan/pengurutan tetap di `applyFilters` sisi klien.

## Arsitektur

### Dependensi
- `@supabase/supabase-js`
- `@supabase/ssr` (pola client server-side resmi untuk App Router)

### Environment
- `.env.local` (TIDAK di-commit — sudah di `.gitignore` bawaan Next):
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://<proyek>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
  ```
- `.env.example` (di-commit) sebagai template berisi kunci tanpa nilai.

### File

**`lib/supabase/server.ts` (BARU)** — factory client server:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component tak bisa set cookie — aman diabaikan di
            // konteks baca; auth (sub-proyek #2) menanganinya via middleware.
          }
        },
      },
    },
  );
}
```
Memakai pola `@supabase/ssr` sejak awal (walau cookies belum krusial untuk baca)
agar tak perlu refactor saat auth masuk di #2.

**`lib/products.ts` (UBAH)** — dari array statis menjadi:
```ts
export async function getAllProducts(): Promise<Product[]>
export async function getProductBySlug(slug: string): Promise<Product | null>
```
- Query: `from("products").select("*").order("created_at", { ascending: false })`.
- Fungsi pemetaan privat `rowToProduct(row)`: snake_case DB → camelCase `Product`.
- `status` diturunkan dari `stock`: `stock > 0 ? "ready" : "preorder"` (sesuai
  PRD §6 — stok 0 = Pre-Order). Kolom status TIDAK disimpan di DB; selalu
  diturunkan agar tak ada inkonsistensi.
- `getProductBySlug` mengembalikan `null` bila tak ada (bukan `undefined`) —
  sejajarkan pemanggil `app/produk/[slug]/page.tsx` (cek `notFound()`).

**Komponen pemanggil (UBAH jadi async/await):**
- `app/page.tsx` — `const products = await getAllProducts();`
- `app/produk/[slug]/page.tsx` — memanggil di **tiga** tempat, semua jadi async:
  - `generateStaticParams()` (baris 10-12) → `await getAllProducts()`. **Nuansa:**
    ini membuat DB di-query saat build dan halaman detail di-pre-render dari data
    build-time — produk yang ditambah setelah build tak punya halaman statis
    sampai rebuild. **Keputusan:** hapus `generateStaticParams` agar rute
    dirender dinamis per request (konsisten dengan katalog dinamis; produk baru
    dari #3 langsung punya halaman tanpa rebuild). Trade-off: kehilangan
    pre-render statis — dapat diterima untuk katalog kecil yang sering berubah.
  - `generateMetadata()` (baris 14-23) → `await getProductBySlug(slug)`.
  - `ProductPage()` (baris 25-28) → `await getProductBySlug(slug)`; null →
    `notFound()`.
- `app/admin/page.tsx` — `await getAllProducts();`

### Skema database — `docs/supabase/schema.sql`
```sql
create table products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  sku         text not null,
  name        text not null,
  brand       text not null,
  material    text not null,
  price       integer not null,       -- rupiah sebagai integer
  stock       integer not null default 0,
  description text not null default '',
  images      jsonb not null default '[]'::jsonb,   -- array URL
  specs       jsonb not null default '{}'::jsonb,   -- {weight, weightAvg, thickness, surface, core}
  created_at  timestamptz not null default now()
);

alter table products enable row level security;

-- Baca publik (anon boleh SELECT); tulis ditolak untuk anon (sub-proyek #3
-- memakai sesi admin terautentikasi).
create policy "Public read access"
  on products for select
  using (true);
```
Catatan: `status` TIDAK ada kolomnya — diturunkan di aplikasi. `id` jadi `uuid`
(bukan string "1".."6"); `Product.id` tetap `string`, uuid cocok.

### Seed — `docs/supabase/seed.sql`
Enam produk yang ada sekarang (dari `lib/products.ts` lama) sebagai `insert`,
agar katalog tak kosong setelah migrasi. `images` & `specs` sebagai literal JSONB.

## Alur setup (dipandu saat implementasi)

1. Pengguna buat akun di supabase.com + proyek baru (gratis).
2. Pengguna salin Project URL + anon key → `.env.local`.
3. Jalankan `schema.sql` lalu `seed.sql` di Supabase SQL Editor.
4. `npm install` dependensi.
5. Ubah kode sesuai di atas.
6. Verifikasi.

## Non-goal (sub-proyek ini)

- Auth, login, proteksi route → #2.
- Create/Update/Delete, upload gambar → #3.
- Caching lanjutan / revalidasi (`use cache`) — pakai default (uncached, fetch
  per request) dulu; optimasi belakangan bila perlu.
- Perubahan `lib/filter.ts` atau komponen katalog/filter.
- Migrasi gambar SVG placeholder ke Storage (masih pakai `/products/*.svg`).

## Risiko & mitigasi

- **Katalog jadi async** → halaman kini menunggu DB. Mitigasi: query cepat (6
  baris); pertimbangkan `loading.tsx` bila perlu (opsional, di luar scope inti).
- **`.env.local` hilang** → build gagal / data kosong. Mitigasi: `.env.example`
  + langkah setup jelas; pesan error ramah bila env tak ada.
- **Kegagalan koneksi/query error** → Mitigasi:
  - `getAllProducts`: bila error, `console.error` & kembalikan `[]` (katalog
    tampil "tidak ada raket" via `ProductGrid` yang sudah menangani array kosong)
    daripada crash halaman.
  - `getProductBySlug`: bila error ATAU tak ditemukan, kembalikan `null` →
    pemanggil memicu `notFound()`. Error koneksi & "produk tak ada" sama-sama
    berujung 404; error tetap di-log agar terbedakan saat debug.
  - Detail final (mis. membedakan 404 vs 500) ditentukan di plan.

## Verifikasi

- `tsc --noEmit` + `eslint` bersih.
- Setelah env & seed terisi: `npm run dev` → katalog menampilkan 6 produk dari
  Supabase (bukan array statis). Ubah 1 baris di DB → refresh → berubah.
- Halaman detail `/produk/<slug>` memuat dari DB; slug tak ada → 404.
- Tabel admin menampilkan data DB.
- Screenshot katalog (mobile + desktop) tetap seperti sebelumnya (tak ada
  regresi visual — hanya sumber data yang berubah).
