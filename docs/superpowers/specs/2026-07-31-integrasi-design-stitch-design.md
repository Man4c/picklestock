# Integrasi Design Stitch AI ke Next.js — PickleStock

**Tanggal:** 2026-07-31
**Status:** Disetujui untuk implementasi

## Tujuan

Menerjemahkan 10 file mockup HTML dari Stitch AI (`D:\Projects\PickleStock\Stitch AI\`)
menjadi aplikasi Next.js 16 yang berjalan, dengan design system dari `DESIGN.md`
dipindahkan utuh ke Tailwind v4.

Hasil akhir tahap ini: **5 layar tampil dan bisa dinavigasi, dengan data statis.**
Belum ada database, belum ada autentikasi nyata.

## Konteks

Project `picklestock` adalah katalog raket pickleball. Pembeli menelusuri katalog dan
memesan lewat WhatsApp; admin mengelola stok lewat dashboard.

Stack terpasang: Next.js 16.2.12 (App Router, Turbopack), React 19.2.4,
TypeScript 5, Tailwind CSS v4.

### Hubungan dengan dokumen lain

- **`docs/PRD.md`** — sumber kebenaran untuk kebutuhan produk. Spec ini mewujudkan
  lapisan tampilan dari PRD tersebut; tidak menggantikannya. Bila keduanya berbeda,
  PRD yang menang.
- **`docs/Design_Tokens.md`** — analisis token dari mockup terdahulu (AJAIRA).
  Digantikan oleh `DESIGN.md` milik Stitch, yang lebih lengkap dan spesifik untuk
  PickleStock. Nilai keduanya konsisten (#111111, #F5F6F8, #F8F9FA, radius 14px),
  jadi tidak ada konflik. Dipertahankan sebagai rujukan sejarah.

PRD menetapkan **Supabase** (PostgreSQL + Storage + Auth) sebagai backend. Tahap ini
belum menyentuhnya; `lib/products.ts` dirancang sebagai satu-satunya titik yang
nanti diganti query Supabase, tanpa menyentuh komponen tampilan.

### Mengapa mockup tidak bisa disalin langsung

1. Stitch menghasilkan **Tailwind v3** lewat CDN (`cdn.tailwindcss.com` + objek
   `tailwind.config` JavaScript). Project ini memakai **Tailwind v4**, yang
   dikonfigurasi lewat CSS (`@theme`). Sintaksnya berbeda total.
2. 21 gambar produk memakai URL sementara `lh3.googleusercontent.com` yang akan mati.
3. Markup-nya HTML statis: modal tidak bisa dibuka, filter tidak menyaring,
   form tidak menyimpan.
4. Ikon memakai font Material Symbols dari CDN Google.

## Keputusan

### Pendekatan: token → `@theme` Tailwind v4

Seluruh token dari `DESIGN.md` dipindahkan ke `app/globals.css` sebagai variabel
CSS di dalam blok `@theme`. Tailwind v4 otomatis membangkitkan utility class dengan
**nama yang identik** dengan yang dipakai markup Stitch (`bg-surface-pure`,
`text-headline-lg`, `px-margin-page`), sehingga markup bisa dipindahkan dengan
perubahan minimal dan mudah dibandingkan dengan mockup aslinya.

Alternatif yang ditolak:
- **CDN Tailwind v3** — dilarang untuk produksi oleh Tailwind (CSS dikompilasi di
  browser tiap load), dan membuang setup v4 yang sudah benar.
- **Tulis ulang dengan class Tailwind standar** — memutus kaitan ke design system;
  mengubah warna brand nanti berarti cari-ganti di puluhan file.

### Ruang lingkup

| Keputusan | Pilihan |
|---|---|
| Kedalaman | Tampilan dengan data statis; tanpa database/auth |
| Halaman | Semua 5 layar, termasuk admin |
| Gambar | Placeholder SVG lokal di `public/products/` |
| Responsif | Satu komponen responsif per halaman (breakpoint `md:`), bukan file terpisah desktop/mobile |
| Ikon | `lucide-react` (SVG inline), menggantikan font Material Symbols dari CDN |
| Dark mode | Tidak ada di tahap ini |

## Arsitektur

### Struktur file

```
app/
  globals.css              token @theme + @font-face
  layout.tsx               font Plus Jakarta Sans + Inter, metadata
  page.tsx                 katalog utama            (/)
  produk/[slug]/page.tsx   detail produk            (/produk/<slug>)
  admin/
    layout.tsx             shell admin (AdminHeader + Footer)
    login/page.tsx         login admin              (/admin/login)
    page.tsx               dashboard stok           (/admin)
components/
  ui/          Button, Input, Badge, IconButton
  layout/      TopNav, Footer, AdminHeader
  catalog/     ProductCard, ProductGrid, FilterSidebar, SearchInput, CatalogView
  product/     ProductDetail, ProductGallery, SpecGrid, WhatsAppButton
  admin/       ProductTable, ProductRow, ProductFormModal, WhatsAppSetting, LoginForm
lib/
  types.ts     tipe Product, StockStatus
  products.ts  data dummy + getAllProducts(), getProductBySlug()
  format.ts    formatRupiah(), buildWhatsAppUrl()
  constants.ts nomor WhatsApp default, daftar brand & material, tahun footer
public/products/  placeholder SVG
```

### Model data

```ts
// lib/types.ts
export type StockStatus = "ready" | "preorder";

export type Product = {
  id: string;
  slug: string;          // untuk URL: "pro-pickleball-paddle-carbon-x"
  sku: string;           // "PDBL-CBX-01"
  name: string;
  brand: string;         // JOOLA | Selkirk | CRBN | Head
  material: string;      // Carbon Fiber | Fiberglass | Composite
  price: number;         // rupiah, integer — diformat saat render
  stock: number;         // 0 berarti preorder
  status: StockStatus;
  description: string;
  images: string[];      // path relatif ke /products/
  createdAt: string;     // ISO date — untuk sort "Terbaru" (PRD §5.A.2)
  specs: {
    weight: string;      // tampilan: "7.8 - 8.2 oz"
    weightAvg: number;   // angka (oz) — untuk filter berat (PRD §5.A.2)
    thickness: string;   // "16 mm"
    surface: string;     // "Raw Carbon Fiber"
    core: string;        // "Polymer Honeycomb"
  };
};
```

`weight` disimpan ganda: string untuk ditampilkan apa adanya seperti mockup, dan
`weightAvg` numerik agar bisa disaring. Alasannya sama dengan `price` — nilai yang
perlu dibandingkan tidak boleh disimpan sebagai teks terformat.

`price` disimpan sebagai integer, bukan string terformat — supaya filter rentang
harga dan pengurutan bisa bekerja. `formatRupiah()` menangani tampilan.

`status` diturunkan dari `stock` saat pembuatan data (0 → `preorder`), tapi
disimpan eksplisit agar admin bisa menandai preorder meski stok terisi.

Data dummy: 6 produk (mockup punya 4; ditambah 2 agar filter terlihat bekerja).

### Server vs Client Component

Default Next.js 16 adalah Server Component. Yang menjadi Client Component hanya
yang butuh state atau event handler:

| Komponen | Jenis | Alasan |
|---|---|---|
| `app/page.tsx` | Server | Hanya menyusun tata letak |
| `CatalogView` | **Client** | State filter, pencarian, urutan |
| `app/produk/[slug]/page.tsx` | Server | Data statis; `generateStaticParams` |
| `ProductGallery` | **Client** | Pilihan thumbnail aktif |
| `app/admin/page.tsx` | Server | Menyusun tata letak |
| `ProductTable` | **Client** | Buka/tutup modal, edit stok |
| `ProductFormModal` | **Client** | State form, tutup via Escape |
| `app/admin/login/page.tsx` | Server | Membungkus `LoginForm` |
| `LoginForm` | **Client** | Toggle lihat password |

Halaman tetap Server Component yang menitipkan bagian interaktif ke komponen
client — sehingga JavaScript yang dikirim ke browser minimal.

### Routing

- `/` — katalog
- `/produk/[slug]` — detail produk. Memakai `generateStaticParams` agar
  ter-prerender. Slug tak dikenal → `notFound()`.
- `/admin/login` — login
- `/admin` — dashboard

Di Next.js 16, `params` adalah **Promise** dan harus di-`await`:

```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
```

Modal tambah/edit produk **bukan route** — ia komponen yang dirender di atas
dashboard, sesuai perilaku aslinya di mockup.

## Design token

Ditulis di `app/globals.css`. Penamaan Tailwind v4 memakai awalan berdasarkan
jenis token (`--color-*`, `--text-*`, `--spacing-*`), berbeda dari objek
bersarang di v3.

```css
@import "tailwindcss";

@theme {
  /* Warna — dari DESIGN.md */
  --color-surface: #fdf8f8;
  --color-surface-pure: #ffffff;
  --color-surface-input: #f8f9fa;
  --color-surface-container-low: #f7f3f2;
  --color-surface-container-high: #ebe7e6;
  --color-surface-container-highest: #e5e2e1;
  --color-surface-dim: #ddd9d8;
  --color-on-surface: #1c1b1b;
  --color-on-surface-variant: #444748;
  --color-primary: #000000;
  --color-on-primary: #ffffff;
  --color-secondary: #585f6c;
  --color-inverse-surface: #313030;
  --color-outline-variant: #c4c7c7;
  --color-border-subtle: #e5e7eb;
  --color-surface-level1: #f5f6f8;  /* latar kartu produk */
  --color-status-available: #111111;
  --color-status-muted: #9ca3af;
  --color-muted: #6b7280;           /* dipakai layar login */
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;

  /* Tipografi */
  --font-display-logo: var(--font-jakarta), sans-serif;
  --font-headline-lg: var(--font-jakarta), sans-serif;
  --font-headline-md: var(--font-jakarta), sans-serif;
  --font-headline-sm: var(--font-jakarta), sans-serif;
  --font-body-lg: var(--font-inter), sans-serif;
  --font-body-md: var(--font-inter), sans-serif;
  --font-body-sm: var(--font-inter), sans-serif;
  --font-label-md: var(--font-inter), sans-serif;
  --font-eyebrow: var(--font-inter), sans-serif;
  --font-price-tag: var(--font-inter), sans-serif;

  --text-display-logo: 20px;
  --text-display-logo--line-height: 24px;
  --text-display-logo--letter-spacing: -0.02em;
  --text-display-logo--font-weight: 800;

  --text-headline-lg: 24px;
  --text-headline-lg--line-height: 32px;
  --text-headline-lg--font-weight: 700;

  --text-headline-md: 18px;
  --text-headline-md--line-height: 24px;
  --text-headline-md--font-weight: 700;

  --text-headline-sm: 14px;
  --text-headline-sm--line-height: 20px;
  --text-headline-sm--font-weight: 600;

  --text-eyebrow: 11px;
  --text-eyebrow--line-height: 16px;
  --text-eyebrow--letter-spacing: 0.1em;
  --text-eyebrow--font-weight: 700;

  --text-body-lg: 16px;
  --text-body-lg--line-height: 24px;
  --text-body-md: 14px;
  --text-body-md--line-height: 20px;
  --text-body-sm: 12px;
  --text-body-sm--line-height: 18px;

  --text-label-md: 13px;
  --text-label-md--line-height: 18px;
  --text-label-md--font-weight: 600;

  --text-price-tag: 16px;
  --text-price-tag--line-height: 20px;
  --text-price-tag--font-weight: 700;

  /* Spacing */
  --spacing-margin-page: 20px;
  --spacing-gutter-grid: 12px;
  --spacing-stack-section: 24px;
  --spacing-padding-card: 16px;

  /* Radius khusus (di luar skala default Tailwind) */
  --radius-btn: 8px;
  --radius-input: 14px;
  --radius-card: 16px;
  --radius-nav: 24px;

  /* Bayangan */
  --shadow-soft: 0px 2px 8px rgb(0 0 0 / 0.04);
  --shadow-card: 0px 2px 8px rgb(0 0 0 / 0.04);
  --shadow-float: 0px 10px 25px rgb(0 0 0 / 0.08);
}
```

Blok `@media (prefers-color-scheme: dark)` bawaan `create-next-app` **dihapus** —
ia menimpa `--background`/`--foreground` dan akan bentrok dengan palet ini.

### Font

Lewat `next/font/google` (self-hosted, tanpa request ke Google saat runtime):

```tsx
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta", subsets: ["latin"], weight: ["600", "700", "800"],
});
const inter = Inter({
  variable: "--font-inter", subsets: ["latin"], weight: ["400", "600", "700"],
});
```

## Penyimpangan dari mockup

Ketidakkonsistenan di output Stitch, beserta keputusannya:

| # | Temuan | Keputusan |
|---|---|---|
| 1 | `DESIGN.md` menyebut `rounded-lg: 1rem`, `code.html` menyebut `0.5rem` | Ikut `code.html` (yang dipakai markup). Nilainya sama dengan default Tailwind v4, jadi tak perlu token khusus. |
| 2 | Layar login memakai `rounded-btn`, `rounded-input`, `rounded-card`, `shadow-card`, `text-muted` — tak ada di `DESIGN.md` | Ditambahkan sebagai token agar konsisten lintas layar. |
| 3 | Tombol login: `bg-primary-container` (#1c1b1b) + `text-on-primary-container` (#858383) → rasio kontras ±3,5:1, di bawah ambang WCAG AA | Diganti `bg-primary` + `text-on-primary` (hitam/putih), sesuai aturan tombol di `DESIGN.md`. |
| 4 | `px-padding-input` bernilai `12px 16px` — dua nilai tak valid untuk properti sumbu tunggal | Diganti `px-4 py-3` eksplisit; token `padding-input` tidak dibuat. |
| 5 | Class `dark:` muncul tak konsisten; `DESIGN.md` tak punya palet gelap | Semua varian `dark:` dihapus. Light-mode saja. |
| 6 | 26 ikon Material Symbols dari CDN Google | Diganti `lucide-react`. Tanpa request eksternal, tanpa nama ikon berkedip sebelum font termuat. |
| 7 | Kartu produk memakai `bg-[#F5F6F8]` hardcoded, padahal `DESIGN.md` menyebutnya "Level 1" | Dijadikan token `--color-surface-level1: #f5f6f8`. |
| 8 | Footer tertulis "© 2024" | Diubah jadi tahun berjalan lewat konstanta. |
| 9 | Mockup katalog menulis "Showing 24 paddles" padahal hanya 4 kartu | Jumlah dihitung dari panjang array hasil filter. |
| 10 | Tombol Prev/Next di dashboard tidak berfungsi | Dipertahankan dalam keadaan disabled, sesuai mockup — di sini kontrolnya memang sudah digambarkan mati. Berbeda dengan "Load More" di katalog, yang digambarkan aktif sehingga lebih jujur untuk tidak dibuat sama sekali. |
| 11 | `DESIGN.md` §Components menjanjikan "floating bottom navigation bar", tapi **tak satu pun dari 10 mockup memuatnya** — navigasi selalu di atas | Mengikuti mockup: hanya `TopNav`. Komponen `BottomNav` tidak dibuat. Satu-satunya elemen `fixed bottom` adalah bilah CTA WhatsApp di detail produk versi mobile. |
| 12 | Tautan nav "Brands" dan "Community" mengarah ke `href="#"`; halamannya tidak ada | Dipertahankan sebagai `<span>` non-interaktif bergaya sama, bukan `<Link>` yang menuju 404. Menjadi tautan sungguhan saat halamannya dibuat. |

## Perilaku

### Katalog (`/`)
- Grid 2 kolom (mobile) → 3 (`md`) → 4 (`lg`).
- Filter merek dan material (banyak pilihan), rentang harga, pencarian nama, urutan.
  Semuanya berjalan di client atas array statis.

**Selisih antara PRD dan mockup Stitch** — PRD §5.A.2 meminta filter *berat raket*
dan sorting *Terpopuler* / *Terbaru*, yang tidak digambarkan di mockup:

| Kebutuhan PRD | Keputusan |
|---|---|
| Filter berat | Dibuat. Data `specs.weight` sudah ada; ditambahkan sebagai grup filter mengikuti gaya visual grup "Material". |
| Sort "Terbaru" | Dibuat. Ditambahkan field `createdAt` pada data dummy. |
| Sort "Terpopuler" | **Tidak dibuat.** Tidak ada data pendukung (jumlah dilihat/dipesan) sampai backend ada; membuatnya sekarang berarti mengarang urutan. Menyusul bersama Supabase. |

Opsi sort yang tersedia: Rekomendasi (urutan asli), Harga Termurah,
Harga Termahal, Terbaru.
- Filter aktif ditampilkan sebagai chip yang bisa dihapus; ada "Clear All".
- Sidebar filter di desktop; baris chip yang bisa digulir di mobile.
- Bila hasil kosong, tampilkan pesan kosong (mockup tidak menyediakan ini).
- Tombol "Load More" **tidak dibuat.** Dengan 6 produk statis ia tak punya fungsi;
  memasangnya dalam keadaan mati justru menyesatkan. Masuk bersama paginasi nyata.

### Detail produk (`/produk/[slug]`)
- Galeri: gambar utama + thumbnail; klik thumbnail mengganti gambar utama.
- Spesifikasi dalam grid 2×2.
- CTA WhatsApp: bilah tetap di bawah (mobile), tombol inline (desktop).
- Slug tak dikenal → halaman 404 Next.js.

### Login admin (`/admin/login`)
- Kartu terpusat, maksimum 400px.
- Toggle lihat/sembunyikan password.
- **Tanpa autentikasi.** Submit mengarahkan ke `/admin` lewat `router.push`.
  Diberi komentar `// TODO: ganti dengan autentikasi sungguhan` yang jelas.

### Dashboard admin (`/admin`)
- Tabel produk; menggulir horizontal di layar sempit.
- Tombol aksi (edit/hapus) muncul saat baris di-hover, seperti mockup.
- Stok bisa diubah lewat input angka — hanya state React, tidak persisten.
- Tombol "Tambah Produk Baru" membuka `ProductFormModal`.
- Pengaturan nomor WhatsApp: di header (desktop), kartu terpisah (mobile).
- **Semua perubahan hilang saat halaman dimuat ulang.** Ditulis eksplisit di
  komentar kode agar tidak disalahpahami sebagai bug.

### Modal tambah/edit produk
- Ditutup lewat tombol Batal, klik latar, atau tombol Escape.
- Fokus dipindahkan ke modal saat dibuka; latar tidak bisa digulir.
- Field: nama, SKU, merek, material, harga, stok, berat, ketebalan, deskripsi, gambar.
- Validasi HTML5 bawaan (`required`). Simpan hanya menutup modal.

### Tautan WhatsApp

Format pesan mengikuti PRD §5.A.4 — dua varian, tergantung status stok:

```ts
// lib/format.ts
export function buildWhatsAppUrl(phone: string, product: Product): string {
  const harga = formatRupiah(product.price);
  const text =
    product.status === "ready"
      ? `Halo Admin, saya mau pesan raket ${product.name} (${harga}). Apakah stoknya masih ada?`
      : `Halo Admin, saya mau Pre-Order raket ${product.name} (${harga}). Kapan estimasi stoknya tersedia?`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
```

Nomor diambil dari `lib/constants.ts`. Membuka di tab baru
(`target="_blank" rel="noopener noreferrer"`).

Label tombol ikut berubah: "Pesan via WhatsApp" bila `ready`,
"Pre-Order via WhatsApp" bila `preorder` — sesuai mockup dan PRD.

## Gambar

Placeholder SVG di `public/products/` — bentuk raket sederhana dalam beberapa warna.
SVG dipilih karena ringan, tajam di semua resolusi, dan jelas terlihat sebagai
placeholder.

Dirender dengan `next/image` (`sharp` sudah terverifikasi berfungsi), memakai
`width`/`height` eksplisit agar tata letak tidak bergeser saat memuat.

## Aksesibilitas

- Semua tombol ikon memiliki `aria-label`.
- Ikon dekoratif diberi `aria-hidden`.
- Input punya `<label>` (`sr-only` bila desainnya tanpa label terlihat).
- Modal: `role="dialog"`, `aria-modal="true"`, tutup dengan Escape.
- Kontras teks/latar minimal 4,5:1 (lihat penyimpangan #3).

## Verifikasi

Tahap ini tidak memakai automated test — belum ada logika bisnis yang layak diuji,
dan menguji markup statis mengunci detail visual yang masih akan berubah.
Uji otomatis masuk bersamaan dengan database dan logika nyata.

Verifikasi yang dijalankan:

1. `npm run build` — harus sukses tanpa error TypeScript.
2. `npm run lint` — harus bersih.
3. `npm run dev` lalu periksa manual tiap halaman di lebar 375px dan 1440px:
   - `/` — filter menyaring, pencarian bekerja, chip terhapus, kondisi kosong tampil
   - `/produk/pro-pickleball-paddle-carbon-x` — thumbnail mengganti gambar utama
   - `/produk/tidak-ada` — menampilkan 404
   - `/admin/login` — toggle password, submit menuju `/admin`
   - `/admin` — modal buka/tutup (termasuk Escape), edit stok
4. Tidak ada request ke `lh3.googleusercontent.com`, `cdn.tailwindcss.com`,
   atau `fonts.googleapis.com` di tab Network.

## Di luar lingkup

Supabase (database, storage, auth), unggah gambar, paginasi, sort "Terpopuler",
dark mode, i18n.

Payment gateway, checkout, dan akun pelanggan sudah dinyatakan di luar lingkup v1.0
oleh PRD §8.

## Langkah berikutnya

Sesuai PRD §3, backend berikutnya adalah **Supabase**: PostgreSQL untuk data produk,
Storage untuk gambar, Auth untuk login admin.

Urutan yang direncanakan:
1. Skema tabel `products` + seed dari `lib/products.ts`
2. Supabase Auth menggantikan login tiruan
3. CRUD nyata di dashboard (PRD §5.B.2)
4. Unggah gambar ke Supabase Storage menggantikan placeholder SVG
5. Pengaturan nomor WhatsApp tersimpan (PRD §5.B.3)

`lib/products.ts` sengaja dijadikan satu-satunya sumber data agar langkah 1 cukup
mengubah isi file itu — komponen tampilan tidak perlu disentuh.
