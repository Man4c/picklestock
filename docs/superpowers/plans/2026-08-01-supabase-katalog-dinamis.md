# Katalog Dinamis dari Supabase — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti sumber data statis `lib/products.ts` dengan query baca dari Supabase, tanpa mengubah komponen tampilan.

**Architecture:** Server components meng-`await` `getAllProducts()`/`getProductBySlug()` yang kini mem-query Supabase lewat client `@supabase/ssr`. Signature fungsi tetap (sesuai AGENTS.md); hanya isinya berubah dari array statis jadi query. `status` diturunkan dari `stock` di aplikasi; `specs` disimpan JSONB.

**Tech Stack:** Next.js 16 (App Router, server components), Supabase (PostgreSQL + `@supabase/ssr`), TypeScript, Tailwind v4.

## Global Constraints

- Data produk HANYA lewat `lib/products.ts` — komponen tampilan tak menyentuh sumber data (AGENTS.md).
- Ubah warna/tipografi hanya via token `app/globals.css` — tak ada hex di komponen (AGENTS.md).
- 100% Free Tier Supabase (PRD §7).
- Tak ada test runner di proyek — verifikasi via `npx tsc --noEmit`, `npx eslint <file>`, dan screenshot Playwright (pola sesi sebelumnya).
- `status` TIDAK disimpan di DB — selalu diturunkan: `stock > 0 ? "ready" : "preorder"` (PRD §6).
- `.env*` sudah di-gitignore — kredensial tak boleh masuk git.
- Ikon `lucide-react`; jangan muat Material Symbols (AGENTS.md).

---

## Task 0: Setup Supabase (dipandu — aksi pengguna)

**Ini bukan tugas kode.** Agen memandu pengguna; pengguna mengeksekusi di dashboard Supabase & mengisi kredensial. Tak ada commit di tugas ini.

**Files:**
- Create: `.env.local` (diisi pengguna; TIDAK di-commit)

- [ ] **Step 1: Pengguna membuat akun & proyek**

Pandu: buka https://supabase.com → Sign up (gratis, tanpa kartu kredit) → "New Project" → beri nama (mis. "picklestock") → pilih region terdekat (mis. Southeast Asia / Singapore) → simpan password database → tunggu proyek siap (~2 menit).

- [ ] **Step 2: Pengguna menyalin kredensial**

Pandu: di dashboard proyek → Settings (ikon gerigi) → "API" → salin:
- "Project URL"
- "anon public" key (bagian Project API keys)

- [ ] **Step 3: Buat `.env.local`**

Pengguna membuat `C:\Users\MSI\Documents\picklestock\.env.local` berisi (ganti nilai):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

- [ ] **Step 4: Verifikasi env tak akan ter-commit**

Run: `git check-ignore .env.local`
Expected: mencetak `.env.local` (artinya diabaikan git).

---

## Task 1: Skema & seed database

**Files:**
- Create: `docs/supabase/schema.sql`
- Create: `docs/supabase/seed.sql`

**Interfaces:**
- Produces: tabel `products` di Supabase dengan 6 baris seed. Kolom: `id uuid`, `slug text unique`, `sku text`, `name text`, `brand text`, `material text`, `price integer`, `stock integer`, `description text`, `images jsonb`, `specs jsonb`, `created_at timestamptz`.

- [ ] **Step 1: Tulis `docs/supabase/schema.sql`**

```sql
-- Skema tabel produk PickleStock.
-- status TIDAK disimpan — diturunkan di aplikasi dari stock.
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  sku         text not null,
  name        text not null,
  brand       text not null,
  material    text not null,
  price       integer not null,
  stock       integer not null default 0,
  description text not null default '',
  images      jsonb not null default '[]'::jsonb,
  specs       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table products enable row level security;

-- Baca publik: anon boleh SELECT. Tulis tak diberi policy → ditolak untuk anon.
-- Sub-proyek #3 memakai sesi admin terautentikasi untuk menulis.
drop policy if exists "Public read access" on products;
create policy "Public read access"
  on products for select
  using (true);
```

- [ ] **Step 2: Tulis `docs/supabase/seed.sql`**

Enam produk dari `lib/products.ts` lama. `images`/`specs` sebagai literal JSONB. `created_at` eksplisit agar urutan "Terbaru" konsisten.

```sql
insert into products (slug, sku, name, brand, material, price, stock, description, images, specs, created_at) values
('pro-pickleball-paddle-carbon-x','PDBL-CBX-01','Pro Pickleball Paddle Carbon X','JOOLA','Carbon Fiber',2500000,5,
 'Dirancang untuk pemain agresif modern, Carbon X menghadirkan spin dan kontrol tak tertandingi. Permukaan raw carbon fiber memaksimalkan gesekan sehingga Anda dapat membentuk pukulan dengan presisi, sementara inti polimer 16mm memberi sentuhan lembut pada dink dan reset.',
 '["/products/paddle-black.svg","/products/paddle-black-2.svg"]',
 '{"weight":"7.8 - 8.2 oz","weightAvg":8.0,"thickness":"16 mm","surface":"Raw Carbon Fiber","core":"Polymer Honeycomb"}','2026-06-01'),
('picklestock-speedster-pro','PS-SPD-02','PickleStock Speedster Pro','Selkirk','Fiberglass',1800000,0,
 'Raket fiberglass bertenaga untuk pemain yang mengutamakan kecepatan bola. Permukaan bertekstur memberi kontrol ekstra pada servis dan drive.',
 '["/products/paddle-red.svg"]',
 '{"weight":"7.6 - 8.0 oz","weightAvg":7.8,"thickness":"13 mm","surface":"Textured Fiberglass","core":"Polymer Honeycomb"}','2026-05-20'),
('control-spin-master','CRBN-CSM-03','Control Spin Master','CRBN','Carbon Fiber',3100000,3,
 'Raket kontrol premium dengan permukaan raw carbon fiber penuh. Pilihan pemain yang mengandalkan permainan net dan penempatan bola presisi.',
 '["/products/paddle-black-2.svg","/products/paddle-black.svg"]',
 '{"weight":"8.0 - 8.4 oz","weightAvg":8.2,"thickness":"16 mm","surface":"Raw Carbon Fiber","core":"Polypropylene Honeycomb"}','2026-06-15'),
('lite-speed-wave','HEAD-LSW-04','Lite Speed Wave','Head','Composite',1200000,0,
 'Raket komposit ringan yang ramah untuk pemula. Bobot rendah mengurangi kelelahan lengan pada permainan panjang.',
 '["/products/paddle-blue.svg"]',
 '{"weight":"7.2 - 7.6 oz","weightAvg":7.4,"thickness":"13 mm","surface":"Composite","core":"Polymer Honeycomb"}','2026-04-10'),
('joola-hyperion-cfs','PDBL-HYP-05','Hyperion CFS Swift','JOOLA','Carbon Fiber',2900000,2,
 'Kombinasi tenaga dan kontrol dengan gagang memanjang untuk jangkauan lebih luas. Cocok untuk pemain dua tangan pada sisi backhand.',
 '["/products/paddle-black.svg"]',
 '{"weight":"8.2 - 8.6 oz","weightAvg":8.4,"thickness":"14 mm","surface":"Carbon Friction Surface","core":"Polymer Honeycomb"}','2026-07-05'),
('selkirk-amped-epic','PS-AMP-06','Amped Epic Control','Selkirk','Composite',1650000,8,
 'Raket serbaguna dengan sweet spot lebar. Pilihan aman bagi pemain menengah yang sedang membangun konsistensi pukulan.',
 '["/products/paddle-blue.svg"]',
 '{"weight":"7.4 - 7.8 oz","weightAvg":7.6,"thickness":"13 mm","surface":"FiberFlex","core":"X5 Core"}','2026-03-22');
```

- [ ] **Step 3: Pengguna menjalankan SQL (dipandu)**

Pandu: dashboard Supabase → "SQL Editor" → New query → tempel isi `schema.sql` → Run. Lalu new query lagi → tempel `seed.sql` → Run. Verifikasi: "Table Editor" → `products` → tampil 6 baris.

- [ ] **Step 4: Commit file SQL**

```bash
git add docs/supabase/schema.sql docs/supabase/seed.sql
git commit -m "feat: skema & seed tabel products Supabase"
```

---

## Task 2: Dependensi & client Supabase

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `.env.example`
- Modify: `package.json` (via npm install)

**Interfaces:**
- Produces: `createClient(): Promise<SupabaseClient>` dari `lib/supabase/server.ts` — client server-side untuk dipakai `lib/products.ts`.

- [ ] **Step 1: Pasang dependensi**

Run: `npm install @supabase/supabase-js @supabase/ssr`
Expected: kedua paket masuk `dependencies` di `package.json`, exit 0.

- [ ] **Step 2: Tulis `lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase untuk server components / server actions. Memakai pola
 * @supabase/ssr sejak awal (walau baca-saja belum butuh cookie) agar tak perlu
 * refactor saat auth masuk di sub-proyek #2.
 */
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
            // Server Component tak boleh menulis cookie — aman diabaikan saat
            // baca; middleware auth (#2) yang akan menyegarkan sesi.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Tulis `.env.example`**

```
# Salin ke .env.local lalu isi dari dashboard Supabase (Settings → API).
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: Type-check & lint**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx eslint lib/supabase/server.ts`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/server.ts .env.example package.json package-lock.json
git commit -m "feat: client Supabase server-side + .env.example"
```

---

## Task 3: `lib/products.ts` membaca dari Supabase

**Files:**
- Modify: `lib/products.ts` (ganti total isi, pertahankan nama ekspor)

**Interfaces:**
- Consumes: `createClient()` dari `lib/supabase/server.ts`; tipe `Product`, `ProductSpecs`, `StockStatus` dari `lib/types.ts`.
- Produces: `getAllProducts(): Promise<Product[]>`, `getProductBySlug(slug: string): Promise<Product | null>`.

- [ ] **Step 1: Tulis ulang `lib/products.ts`**

```ts
import type { Product, ProductSpecs, StockStatus } from "./types";
import { createClient } from "./supabase/server";

/** Baris mentah dari tabel `products` (snake_case, specs/images JSONB). */
type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  material: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  specs: ProductSpecs;
  created_at: string;
};

function rowToProduct(row: ProductRow): Product {
  const status: StockStatus = row.stock > 0 ? "ready" : "preorder";
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    material: row.material,
    price: row.price,
    stock: row.stock,
    status,
    description: row.description,
    images: row.images,
    createdAt: row.created_at,
    specs: row.specs,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllProducts] gagal memuat produk:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`[getProductBySlug] gagal memuat '${slug}':`, error.message);
    return null;
  }
  return data ? rowToProduct(data as ProductRow) : null;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0. (Akan tetap 0 walau pemanggil belum di-`await` karena TS mengizinkan `.map` atas Promise? TIDAK — akan error. Task 4 memperbaiki pemanggil. Jika ingin hijau di sini, lanjutkan ke Task 4 sebelum menganggap selesai — kedua task satu unit logis. Boleh commit setelah Task 4 hijau.)

- [ ] **Step 3: Commit (bersama Task 4 bila tsc merah)**

Bila `tsc` hijau sendiri, commit sekarang; bila merah karena pemanggil, kerjakan Task 4 dulu lalu commit bersama:
```bash
git add lib/products.ts
git commit -m "feat: getAllProducts/getProductBySlug baca dari Supabase"
```

---

## Task 4: Sesuaikan komponen pemanggil jadi async

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/produk/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllProducts(): Promise<Product[]>`, `getProductBySlug(slug): Promise<Product | null>`.

- [ ] **Step 1: `app/page.tsx` — await**

Ubah `export default function Home()` jadi `async`, dan `const products = getAllProducts();` jadi `const products = await getAllProducts();`.

```tsx
export default async function Home() {
  const products = await getAllProducts();
  // ...sisa tak berubah
}
```

- [ ] **Step 2: `app/admin/page.tsx` — await**

Ubah `export default function AdminPage()` jadi `async`, `const products = getAllProducts();` → `await getAllProducts();`.

- [ ] **Step 3: `app/produk/[slug]/page.tsx` — hapus generateStaticParams, await sisanya**

Hapus blok `generateStaticParams` (baris 10-12) sepenuhnya — rute jadi dinamis per request. Di `generateMetadata` dan `ProductPage`, `getProductBySlug(slug)` → `await getProductBySlug(slug)`.

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan — PickleStock" };
  return {
    title: `${product.name} — PickleStock`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <TopNav />
      <ProductDetail product={product} />
      <Footer />
    </>
  );
}
```
Catatan: `getAllProducts` tak lagi diimpor di file ini (dipakai hanya oleh generateStaticParams yang dihapus). Hapus dari import.

- [ ] **Step 4: Type-check & lint**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx eslint app/page.tsx app/admin/page.tsx "app/produk/[slug]/page.tsx"`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/admin/page.tsx "app/produk/[slug]/page.tsx" lib/products.ts
git commit -m "feat: komponen katalog & admin membaca produk async dari Supabase"
```

---

## Task 5: Verifikasi end-to-end

**Files:** tak ada perubahan kode — hanya verifikasi.

- [ ] **Step 1: Jalankan dev server**

Run (background): `npm run dev`
Tunggu "Ready". Catat port (3000/3001).

- [ ] **Step 2: Verifikasi katalog memuat dari DB**

Screenshot Playwright `http://localhost:<port>` di 390px & 1280px. Harapkan: 6 produk tampil, identik dengan sebelum migrasi (tak ada regresi visual). Bila kosong → cek `.env.local` & seed.

- [ ] **Step 3: Verifikasi data benar-benar dari DB (bukan cache statis)**

Di Supabase Table Editor, ubah `name` satu produk. Refresh halaman. Harapkan: nama berubah. Kembalikan seperti semula.

- [ ] **Step 4: Verifikasi halaman detail**

Buka `http://localhost:<port>/produk/pro-pickleball-paddle-carbon-x`. Harapkan: detail termuat. Buka slug ngawur `/produk/tidak-ada` → 404.

- [ ] **Step 5: Verifikasi tabel admin**

Buka `/admin`. Harapkan: tabel menampilkan 6 produk dari DB.

- [ ] **Step 6: Type-check & lint final**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint .` → exit 0.

- [ ] **Step 7: Update AGENTS.md (catatan sumber data berubah)**

Perbarui baris di AGENTS.md yang menyatakan data dari `lib/products.ts` statis → catat kini dari Supabase (baca), env di `.env.local`, skema di `docs/supabase/`.

```bash
git add AGENTS.md
git commit -m "docs: catat sumber data kini dari Supabase di AGENTS.md"
```

---

## Self-Review (diisi penulis rencana)

**Spec coverage:**
- Skema JSONB + RLS → Task 1 ✓
- Client `@supabase/ssr` + env → Task 2 ✓
- `lib/products.ts` async, signature tetap, status diturunkan → Task 3 ✓
- Pemanggil async, generateStaticParams dihapus → Task 4 ✓
- Penanganan error (`[]` / `null`) → Task 3 (rowToProduct + guard) ✓
- Alur setup dipandu → Task 0 ✓
- Verifikasi (screenshot, DB round-trip, 404) → Task 5 ✓
- Non-goal (auth/CRUD/storage) → tak ada task, benar ✓

**Placeholder scan:** tak ada TODO/TBD; semua step berisi kode/perintah nyata.

**Type consistency:** `createClient` (Task 2) dipakai Task 3 ✓. `getAllProducts`/`getProductBySlug` return `Promise<Product[]>`/`Promise<Product | null>` (Task 3) dikonsumsi Task 4 dengan `await` ✓. `rowToProduct`/`ProductRow` internal Task 3 ✓.
