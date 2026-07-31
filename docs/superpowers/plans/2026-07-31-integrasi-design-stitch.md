# Integrasi Design Stitch AI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menerjemahkan 10 mockup HTML Stitch AI menjadi 5 layar Next.js yang berjalan dengan data statis.

**Architecture:** Design token dari `DESIGN.md` dipindahkan ke `app/globals.css` sebagai blok `@theme` Tailwind v4, sehingga utility class yang dibangkitkan bernama identik dengan yang dipakai markup Stitch. Halaman berupa Server Component yang menitipkan bagian interaktif ke Client Component. Data berasal dari `lib/products.ts` — satu-satunya titik yang nanti diganti query Supabase.

**Tech Stack:** Next.js 16.2.12 (App Router, Turbopack), React 19.2.4, TypeScript 5, Tailwind CSS v4, lucide-react, next/font.

**Spec:** `docs/superpowers/specs/2026-07-31-integrasi-design-stitch-design.md`
**Sumber mockup:** `D:\Projects\PickleStock\Stitch AI\`

## Global Constraints

- **Tailwind v4** — konfigurasi lewat `@theme` di CSS. JANGAN membuat `tailwind.config.js`; JANGAN memakai `cdn.tailwindcss.com`.
- **Nama token v4 memakai awalan jenis**: `--color-*`, `--text-*`, `--font-*`, `--spacing-*`, `--radius-*`, `--shadow-*`.
- **`params` adalah Promise** di Next.js 16 — wajib di-`await`.
- **Server Component adalah default.** Bubuhkan `"use client"` hanya pada komponen yang butuh state/event/hook browser.
- **Light mode saja.** Jangan menulis varian `dark:`.
- **Tanpa permintaan jaringan eksternal**: tanpa `lh3.googleusercontent.com`, `cdn.tailwindcss.com`, `fonts.googleapis.com`. Font lewat `next/font/google` (self-hosted), ikon lewat `lucide-react`.
- **Bahasa UI**: label dan tombol dalam bahasa Indonesia sesuai mockup ("Pesan via WhatsApp", "Tambah Produk Baru", "Manajemen Stok Produk").
- **Harga** disimpan `number`, ditampilkan lewat `formatRupiah()`. Jangan menyimpan harga sebagai string terformat.
- **Aksesibilitas**: tombol ikon wajib `aria-label`; ikon dekoratif `aria-hidden`; kontras teks minimal 4,5:1.
- Verifikasi tiap task: `npm run build` dan `npm run lint` harus lolos.

## Struktur file

| File | Tanggung jawab |
|---|---|
| `app/globals.css` | Design token `@theme` |
| `app/layout.tsx` | Font, metadata, shell HTML |
| `lib/types.ts` | Tipe `Product`, `StockStatus` |
| `lib/constants.ts` | Nomor WhatsApp, daftar brand/material, tahun |
| `lib/format.ts` | `formatRupiah()`, `buildWhatsAppUrl()` |
| `lib/products.ts` | Data dummy + `getAllProducts()`, `getProductBySlug()` |
| `components/ui/*` | Primitif: Button, Input, Badge, IconButton |
| `components/layout/*` | TopNav, Footer, AdminHeader |
| `components/catalog/*` | CatalogView (client), FilterSidebar, ProductCard, ProductGrid |
| `components/product/*` | ProductDetail, ProductGallery (client), SpecGrid, WhatsAppButton |
| `components/admin/*` | LoginForm, ProductTable, ProductFormModal, WhatsAppSetting |
| `app/page.tsx` | Rute katalog |
| `app/produk/[slug]/page.tsx` | Rute detail |
| `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/login/page.tsx` | Rute admin |

## Urutan task

1. Fondasi: dependensi, token, font
2. Lapisan data: tipe, konstanta, format, produk
3. Placeholder gambar SVG
4. Primitif UI
5. Komponen layout
6. Katalog
7. Detail produk
8. Login admin
9. Dashboard admin + modal
10. Verifikasi menyeluruh

---

### Task 1: Fondasi — dependensi, design token, font

**Files:**
- Modify: `app/globals.css` (ganti seluruh isi)
- Modify: `app/layout.tsx` (ganti seluruh isi)
- Modify: `package.json` (lewat npm install)

**Interfaces:**
- Consumes: —
- Produces: utility class Tailwind (`bg-surface-pure`, `text-headline-lg`, `px-margin-page`, `rounded-card`, `shadow-soft`, dst.); variabel font `--font-jakarta` dan `--font-inter`.

- [ ] **Step 1: Pasang lucide-react**

```bash
npm install lucide-react
```

Expected: `added 1 package`. Ikon menjadi SVG inline, menggantikan font Material Symbols dari CDN.

- [ ] **Step 2: Tulis ulang `app/globals.css`**

Ganti **seluruh** isi file. Blok `@media (prefers-color-scheme: dark)` bawaan `create-next-app` harus hilang — ia menimpa `--background`/`--foreground` dan bentrok dengan palet ini.

```css
@import "tailwindcss";

@theme {
  /* ── Warna ─────────────────────────────────── */
  --color-surface: #fdf8f8;
  --color-surface-pure: #ffffff;
  --color-surface-input: #f8f9fa;
  --color-surface-level1: #f5f6f8;
  --color-surface-container: #f1edec;
  --color-surface-container-low: #f7f3f2;
  --color-surface-container-high: #ebe7e6;
  --color-surface-container-highest: #e5e2e1;
  --color-surface-dim: #ddd9d8;
  --color-surface-variant: #e5e2e1;

  --color-on-surface: #1c1b1b;
  --color-on-surface-variant: #444748;

  --color-primary: #000000;
  --color-on-primary: #ffffff;
  --color-primary-container: #1c1b1b;
  --color-on-primary-container: #858383;
  --color-inverse-surface: #313030;

  --color-secondary: #585f6c;
  --color-on-secondary: #ffffff;

  --color-outline: #747878;
  --color-outline-variant: #c4c7c7;
  --color-border-subtle: #e5e7eb;

  --color-status-available: #111111;
  --color-status-muted: #9ca3af;
  --color-muted: #6b7280;

  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  /* ── Font family ───────────────────────────── */
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

  /* ── Ukuran teks ───────────────────────────── */
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
  --text-body-lg--font-weight: 400;

  --text-body-md: 14px;
  --text-body-md--line-height: 20px;
  --text-body-md--font-weight: 400;

  --text-body-sm: 12px;
  --text-body-sm--line-height: 18px;
  --text-body-sm--font-weight: 400;

  --text-label-md: 13px;
  --text-label-md--line-height: 18px;
  --text-label-md--font-weight: 600;

  --text-price-tag: 16px;
  --text-price-tag--line-height: 20px;
  --text-price-tag--font-weight: 700;

  /* ── Spacing ───────────────────────────────── */
  --spacing-margin-page: 20px;
  --spacing-gutter-grid: 12px;
  --spacing-stack-section: 24px;
  --spacing-padding-card: 16px;

  /* ── Radius ────────────────────────────────── */
  --radius-btn: 8px;
  --radius-input: 14px;
  --radius-card: 16px;
  --radius-nav: 24px;

  /* ── Bayangan ──────────────────────────────── */
  --shadow-soft: 0px 2px 8px rgb(0 0 0 / 0.04);
  --shadow-card: 0px 2px 8px rgb(0 0 0 / 0.04);
  --shadow-float: 0px 10px 25px rgb(0 0 0 / 0.08);
}

/* Menyembunyikan scrollbar pada baris chip filter yang bisa digulir */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Ruang aman untuk bilah CTA tetap di iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/*
 * Checkbox bergaya design system.
 * Mockup Stitch memuat plugin `forms` lewat CDN (`?plugins=forms`); project ini
 * tidak memakainya, sehingga `text-primary` pada <input type="checkbox"> tidak
 * berpengaruh apa pun — kotaknya akan tampil biru bawaan browser.
 * `accent-color` mencapai hasil yang sama tanpa dependensi tambahan.
 */
input[type="checkbox"] {
  accent-color: var(--color-primary);
}
```

- [ ] **Step 3: Tulis ulang `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PickleStock — Katalog Raket Pickleball",
  description:
    "Cek ketersediaan stok raket pickleball dan pesan langsung via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-surface-pure font-body-md text-body-md text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
```

Catatan: `lang="id"` — situsnya berbahasa Indonesia.

- [ ] **Step 4: Verifikasi token terbangkitkan**

Ganti sementara isi `app/page.tsx` dengan:

```tsx
export default function Home() {
  return (
    <div className="p-margin-page">
      <h1 className="font-headline-lg text-headline-lg text-on-surface">Uji token</h1>
      <p className="font-body-sm text-body-sm text-secondary">Teks sekunder</p>
      <div className="mt-4 rounded-card bg-surface-level1 p-padding-card shadow-soft">
        Kartu
      </div>
    </div>
  );
}
```

Run: `npm run build`
Expected: `✓ Compiled successfully`, tanpa error TypeScript.

- [ ] **Step 5: Periksa CSS hasil build memuat token**

Run:
```bash
grep -rl "surface-level1\|headline-lg" .next/static/css/ | head -3
```
Expected: minimal satu file CSS terdaftar. Bila kosong, nama token salah — periksa awalan (`--color-`, `--text-`, `--spacing-`, `--radius-`, `--shadow-`).

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx package.json package-lock.json
git commit -m "feat: design token Stitch ke @theme Tailwind v4 + font"
```

---

### Task 2: Lapisan data

**Files:**
- Create: `lib/types.ts`, `lib/constants.ts`, `lib/format.ts`, `lib/products.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `type StockStatus = "ready" | "preorder"`
  - `type Product` (lihat Step 1)
  - `type SortOption = "recommended" | "price-asc" | "price-desc" | "newest"`
  - `WHATSAPP_NUMBER: string`, `BRANDS: readonly string[]`, `MATERIALS: readonly string[]`, `FOOTER_YEAR: number`
  - `formatRupiah(value: number): string`
  - `buildWhatsAppUrl(phone: string, product: Product): string`
  - `getAllProducts(): Product[]`
  - `getProductBySlug(slug: string): Product | undefined`

- [ ] **Step 1: Buat `lib/types.ts`**

```ts
export type StockStatus = "ready" | "preorder";

export type SortOption =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "newest";

export type ProductSpecs = {
  /** Teks tampilan apa adanya, mis. "7.8 - 8.2 oz" */
  weight: string;
  /** Angka (oz) untuk penyaringan — teks tidak bisa dibandingkan */
  weightAvg: number;
  thickness: string;
  surface: string;
  core: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  material: string;
  /** Rupiah sebagai integer; diformat saat render */
  price: number;
  stock: number;
  status: StockStatus;
  description: string;
  images: string[];
  /** ISO date, untuk urutan "Terbaru" */
  createdAt: string;
  specs: ProductSpecs;
};
```

- [ ] **Step 2: Buat `lib/constants.ts`**

```ts
/** Nomor tujuan pesanan WhatsApp. Nanti dapat diatur admin lewat Supabase. */
export const WHATSAPP_NUMBER = "+62 812-3456-7890";

export const BRANDS = ["JOOLA", "Selkirk", "CRBN", "Head"] as const;

export const MATERIALS = ["Carbon Fiber", "Fiberglass", "Composite"] as const;

/** Rentang berat (oz) untuk filter — PRD §5.A.2 */
export const WEIGHT_RANGES = [
  { label: "Ringan (< 7.8 oz)", min: 0, max: 7.8 },
  { label: "Sedang (7.8 – 8.2 oz)", min: 7.8, max: 8.2 },
  { label: "Berat (> 8.2 oz)", min: 8.2, max: Infinity },
] as const;

export const FOOTER_YEAR = 2026;

export const SITE_NAME = "PickleStock";
```

- [ ] **Step 3: Buat `lib/format.ts`**

```ts
import type { Product } from "./types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 2500000 → "Rp2.500.000" */
export function formatRupiah(value: number): string {
  return rupiah.format(value).replace(/\s/g, "");
}

/**
 * Tautan wa.me dengan pesan otomatis. Format mengikuti PRD §5.A.4 —
 * kalimatnya berbeda antara pesanan biasa dan pre-order.
 */
export function buildWhatsAppUrl(phone: string, product: Product): string {
  const harga = formatRupiah(product.price);
  const text =
    product.status === "ready"
      ? `Halo Admin, saya mau pesan raket ${product.name} (${harga}). Apakah stoknya masih ada?`
      : `Halo Admin, saya mau Pre-Order raket ${product.name} (${harga}). Kapan estimasi stoknya tersedia?`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
```

Catatan `replace(/\s/g, "")`: `Intl` bahasa Indonesia menghasilkan `"Rp 2.500.000"` dengan spasi non-breaking; mockup menulis `"Rp2.500.000"` tanpa spasi.

- [ ] **Step 4: Buat `lib/products.ts`**

Empat produk pertama diambil dari mockup; dua terakhir ditambahkan agar filter terlihat bekerja.

```ts
import type { Product } from "./types";

const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "pro-pickleball-paddle-carbon-x",
    sku: "PDBL-CBX-01",
    name: "Pro Pickleball Paddle Carbon X",
    brand: "JOOLA",
    material: "Carbon Fiber",
    price: 2500000,
    stock: 5,
    status: "ready",
    description:
      "Dirancang untuk pemain agresif modern, Carbon X menghadirkan spin dan kontrol tak tertandingi. Permukaan raw carbon fiber memaksimalkan gesekan sehingga Anda dapat membentuk pukulan dengan presisi, sementara inti polimer 16mm memberi sentuhan lembut pada dink dan reset.",
    images: ["/products/paddle-black.svg", "/products/paddle-black-2.svg"],
    createdAt: "2026-06-01",
    specs: {
      weight: "7.8 - 8.2 oz",
      weightAvg: 8.0,
      thickness: "16 mm",
      surface: "Raw Carbon Fiber",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "2",
    slug: "picklestock-speedster-pro",
    sku: "PS-SPD-02",
    name: "PickleStock Speedster Pro",
    brand: "Selkirk",
    material: "Fiberglass",
    price: 1800000,
    stock: 0,
    status: "preorder",
    description:
      "Raket fiberglass bertenaga untuk pemain yang mengutamakan kecepatan bola. Permukaan bertekstur memberi kontrol ekstra pada servis dan drive.",
    images: ["/products/paddle-red.svg"],
    createdAt: "2026-05-20",
    specs: {
      weight: "7.6 - 8.0 oz",
      weightAvg: 7.8,
      thickness: "13 mm",
      surface: "Textured Fiberglass",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "3",
    slug: "control-spin-master",
    sku: "CRBN-CSM-03",
    name: "Control Spin Master",
    brand: "CRBN",
    material: "Carbon Fiber",
    price: 3100000,
    stock: 3,
    status: "ready",
    description:
      "Raket kontrol premium dengan permukaan raw carbon fiber penuh. Pilihan pemain yang mengandalkan permainan net dan penempatan bola presisi.",
    images: ["/products/paddle-black-2.svg", "/products/paddle-black.svg"],
    createdAt: "2026-06-15",
    specs: {
      weight: "8.0 - 8.4 oz",
      weightAvg: 8.2,
      thickness: "16 mm",
      surface: "Raw Carbon Fiber",
      core: "Polypropylene Honeycomb",
    },
  },
  {
    id: "4",
    slug: "lite-speed-wave",
    sku: "HEAD-LSW-04",
    name: "Lite Speed Wave",
    brand: "Head",
    material: "Composite",
    price: 1200000,
    stock: 0,
    status: "preorder",
    description:
      "Raket komposit ringan yang ramah untuk pemula. Bobot rendah mengurangi kelelahan lengan pada permainan panjang.",
    images: ["/products/paddle-blue.svg"],
    createdAt: "2026-04-10",
    specs: {
      weight: "7.2 - 7.6 oz",
      weightAvg: 7.4,
      thickness: "13 mm",
      surface: "Composite",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "5",
    slug: "joola-hyperion-cfs",
    sku: "PDBL-HYP-05",
    name: "Hyperion CFS Swift",
    brand: "JOOLA",
    material: "Carbon Fiber",
    price: 2900000,
    stock: 2,
    status: "ready",
    description:
      "Kombinasi tenaga dan kontrol dengan gagang memanjang untuk jangkauan lebih luas. Cocok untuk pemain dua tangan pada sisi backhand.",
    images: ["/products/paddle-black.svg"],
    createdAt: "2026-07-05",
    specs: {
      weight: "8.2 - 8.6 oz",
      weightAvg: 8.4,
      thickness: "14 mm",
      surface: "Carbon Friction Surface",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "6",
    slug: "selkirk-amped-epic",
    sku: "PS-AMP-06",
    name: "Amped Epic Control",
    brand: "Selkirk",
    material: "Composite",
    price: 1650000,
    stock: 8,
    status: "ready",
    description:
      "Raket serbaguna dengan sweet spot lebar. Pilihan aman bagi pemain menengah yang sedang membangun konsistensi pukulan.",
    images: ["/products/paddle-blue.svg"],
    createdAt: "2026-03-22",
    specs: {
      weight: "7.4 - 7.8 oz",
      weightAvg: 7.6,
      thickness: "13 mm",
      surface: "FiberFlex",
      core: "X5 Core",
    },
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
```

- [ ] **Step 5: Verifikasi tipe**

Run: `npx tsc --noEmit`
Expected: keluaran kosong (tanpa error).

- [ ] **Step 6: Commit**

```bash
git add lib/
git commit -m "feat: lapisan data produk, format rupiah, dan tautan WhatsApp"
```

---

### Task 3: Placeholder gambar SVG

**Files:**
- Create: `public/products/paddle-black.svg`, `paddle-black-2.svg`, `paddle-red.svg`, `paddle-blue.svg`

**Interfaces:**
- Consumes: —
- Produces: berkas statis di `/products/*.svg`, dirujuk oleh `lib/products.ts`.

- [ ] **Step 1: Buat `public/products/paddle-black.svg`**

Kanvas 400×500 agar cocok dengan rasio `aspect-[4/5]` di kartu produk.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img" aria-label="Placeholder raket pickleball">
  <rect width="400" height="500" fill="#ffffff"/>
  <rect x="110" y="40" width="180" height="240" rx="90" fill="#1c1b1b"/>
  <rect x="122" y="52" width="156" height="216" rx="78" fill="#2a2929"/>
  <rect x="185" y="280" width="30" height="120" rx="10" fill="#3a3838"/>
  <rect x="180" y="380" width="40" height="80" rx="16" fill="#111111"/>
  <text x="200" y="490" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">placeholder</text>
</svg>
```

- [ ] **Step 2: Buat `public/products/paddle-black-2.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img" aria-label="Placeholder raket pickleball">
  <rect width="400" height="500" fill="#ffffff"/>
  <rect x="105" y="35" width="190" height="250" rx="60" fill="#111111"/>
  <rect x="118" y="48" width="164" height="224" rx="52" fill="#242323"/>
  <rect x="186" y="285" width="28" height="115" rx="9" fill="#3a3838"/>
  <rect x="180" y="378" width="40" height="82" rx="16" fill="#1c1b1b"/>
  <text x="200" y="490" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">placeholder</text>
</svg>
```

- [ ] **Step 3: Buat `public/products/paddle-red.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img" aria-label="Placeholder raket pickleball">
  <rect width="400" height="500" fill="#ffffff"/>
  <rect x="110" y="40" width="180" height="240" rx="90" fill="#b3261e"/>
  <rect x="122" y="52" width="156" height="216" rx="78" fill="#d33a30"/>
  <rect x="185" y="280" width="30" height="120" rx="10" fill="#5c5c5c"/>
  <rect x="180" y="380" width="40" height="80" rx="16" fill="#2a2929"/>
  <text x="200" y="490" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">placeholder</text>
</svg>
```

- [ ] **Step 4: Buat `public/products/paddle-blue.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img" aria-label="Placeholder raket pickleball">
  <rect width="400" height="500" fill="#ffffff"/>
  <rect x="110" y="40" width="180" height="240" rx="90" fill="#3b5b8c"/>
  <rect x="122" y="52" width="156" height="216" rx="78" fill="#5578ad"/>
  <rect x="185" y="280" width="30" height="120" rx="10" fill="#e5e7eb"/>
  <rect x="180" y="380" width="40" height="80" rx="16" fill="#c4c7c7"/>
  <text x="200" y="490" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">placeholder</text>
</svg>
```

- [ ] **Step 5: Verifikasi keempat berkas ada**

Run: `ls public/products/`
Expected: `paddle-black-2.svg  paddle-black.svg  paddle-blue.svg  paddle-red.svg`

- [ ] **Step 6: Commit**

```bash
git add public/products/
git commit -m "feat: placeholder SVG raket menggantikan URL Stitch yang fana"
```

---

### Task 4: Primitif UI

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/Input.tsx`, `components/ui/IconButton.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - `<Button variant="primary" | "secondary" | "ghost" size="sm" | "md" | "lg" fullWidth?>` — meneruskan seluruh props `<button>`
  - `<Badge status="ready" | "preorder">` — teks berasal dari `children`
  - `<Input>` — meneruskan seluruh props `<input>`; menerima `className` tambahan
  - `<IconButton label="..." >` — `label` wajib, menjadi `aria-label`

Semuanya Server Component (tanpa `"use client"`) — hanya menghasilkan markup.

- [ ] **Step 1: Buat `components/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-inverse-surface",
  secondary:
    "bg-surface-pure text-on-surface border border-border-subtle hover:border-primary",
  ghost: "bg-transparent text-on-surface hover:bg-surface-container-high",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
  lg: "px-6 py-3.5",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-label-md text-label-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Buat `components/ui/Badge.tsx`**

```tsx
import type { ReactNode } from "react";
import type { StockStatus } from "@/lib/types";

type Props = {
  status: StockStatus;
  children: ReactNode;
};

/** Label pil status stok. Ready: isi gelap; pre-order: abu redup. */
export function Badge({ status, children }: Props) {
  const tone =
    status === "ready"
      ? "bg-status-available text-on-primary"
      : "bg-surface-dim text-secondary border border-border-subtle";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 font-eyebrow text-eyebrow uppercase ${tone}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Buat `components/ui/Input.tsx`**

```tsx
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: Props) {
  return (
    <input
      className={`w-full rounded-input border border-border-subtle bg-surface-input px-4 py-3 font-body-md text-body-md text-on-surface transition-colors placeholder:text-status-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      {...rest}
    />
  );
}
```

Catatan: `px-4 py-3` eksplisit — token `padding-input` bernilai `12px 16px` yang tidak valid untuk properti sumbu tunggal (penyimpangan #4 di spec).

- [ ] **Step 4: Buat `components/ui/IconButton.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Wajib — pembaca layar tidak dapat membaca ikon. */
  label: string;
  children: ReactNode;
};

export function IconButton({ label, className = "", children, ...rest }: Props) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

`label` sengaja dibuat wajib dan `aria-label` di-`Omit` dari props — mustahil lupa memberi nama tombol ikon.

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya tanpa keluaran error.

- [ ] **Step 6: Commit**

```bash
git add components/ui/
git commit -m "feat: primitif UI Button, Badge, Input, IconButton"
```

---

### Task 5: Komponen layout

**Files:**
- Create: `components/layout/TopNav.tsx`, `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `SITE_NAME`, `FOOTER_YEAR` dari `@/lib/constants`
- Produces: `<TopNav />`, `<Footer />` — keduanya Server Component tanpa props.

- [ ] **Step 1: Buat `components/layout/TopNav.tsx`**

Tautan "Brands" dan "Community" dirender sebagai `<span>`, bukan `<Link>` — halamannya belum ada, dan tautan menuju 404 lebih buruk daripada teks biasa (penyimpangan #12).

```tsx
import Link from "next/link";
import { User } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function TopNav() {
  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-margin-page backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-display-logo text-display-logo tracking-tighter text-primary"
        >
          {SITE_NAME}
        </Link>
        <div className="hidden gap-6 md:flex">
          <Link
            href="/"
            className="border-b-2 border-primary pb-[21px] pt-[21px] font-label-md text-label-md font-bold text-primary"
          >
            Shop
          </Link>
          {/* Belum ada halamannya — teks biasa, bukan tautan mati */}
          <span className="py-[21px] font-label-md text-label-md text-status-muted">
            Brands
          </span>
          <span className="py-[21px] font-label-md text-label-md text-status-muted">
            Community
          </span>
        </div>
      </div>
      <Link
        href="/admin/login"
        aria-label="Masuk sebagai admin"
        title="Masuk sebagai admin"
        className="inline-flex items-center justify-center rounded-full p-2 text-primary transition-colors hover:bg-surface-variant/50"
      >
        <User size={20} aria-hidden="true" />
      </Link>
    </nav>
  );
}
```

Ikon orang di mockup tidak punya tujuan; diarahkan ke `/admin/login` agar admin punya jalan masuk.

- [ ] **Step 2: Buat `components/layout/Footer.tsx`**

```tsx
import { SITE_NAME, FOOTER_YEAR } from "@/lib/constants";

const LINKS = ["About Us", "Shipping Policy", "Terms of Service", "Contact"];

export function Footer() {
  return (
    <footer className="mt-12 flex w-full flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-margin-page py-stack-section md:flex-row">
      <div className="font-display-logo text-display-logo text-primary">
        {SITE_NAME}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {LINKS.map((label) => (
          <span
            key={label}
            className="font-body-sm text-body-sm text-status-muted"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="text-center font-body-sm text-body-sm text-secondary md:text-right">
        © {FOOTER_YEAR} {SITE_NAME}. Engineered for Performance.
      </div>
    </footer>
  );
}
```

Tautan footer juga `<span>` dengan alasan sama.

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: tanpa error.

- [ ] **Step 4: Commit**

```bash
git add components/layout/
git commit -m "feat: TopNav dan Footer"
```

---

### Task 6: Kartu produk dan grid

**Files:**
- Create: `components/catalog/ProductCard.tsx`, `components/catalog/ProductGrid.tsx`

**Interfaces:**
- Consumes: `Product` dari `@/lib/types`; `formatRupiah`, `buildWhatsAppUrl` dari `@/lib/format`; `WHATSAPP_NUMBER` dari `@/lib/constants`; `Badge` dari `@/components/ui/Badge`
- Produces:
  - `<ProductCard product={product} />`
  - `<ProductGrid products={products} />`

Keduanya Server Component — tautan WhatsApp berupa `<a>`, bukan tombol ber-handler.

- [ ] **Step 1: Buat `components/catalog/ProductCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatRupiah, buildWhatsAppUrl } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  const ready = product.status === "ready";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-surface-level1 transition-shadow hover:shadow-soft">
      <div className="absolute left-3 top-3 z-10">
        <Badge status={product.status}>
          {ready ? "Tersedia" : "Pre-Order"}
        </Badge>
      </div>

      <Link
        href={`/produk/${product.slug}`}
        className="flex aspect-[4/5] items-center justify-center overflow-hidden border-b border-border-subtle/50 bg-surface-pure p-4"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={500}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-padding-card">
        <span className="mb-1 font-body-sm text-body-sm text-secondary">
          {product.brand} • {product.material}
        </span>
        <h2 className="mb-3 line-clamp-2 font-headline-sm text-headline-sm leading-tight text-on-surface">
          <Link href={`/produk/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>

        <div className="mt-auto">
          <p className="mb-4 font-price-tag text-price-tag text-on-surface">
            {formatRupiah(product.price)}
          </p>
          <a
            href={buildWhatsAppUrl(WHATSAPP_NUMBER, product)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-btn py-2.5 font-label-md text-label-md transition-colors ${
              ready
                ? "bg-primary text-on-primary hover:bg-inverse-surface"
                : "border border-border-subtle bg-transparent text-on-surface hover:border-primary"
            }`}
          >
            <MessageCircle size={18} aria-hidden="true" />
            {ready ? "Pesan via WhatsApp" : "Pre-Order via WhatsApp"}
          </a>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Buat `components/catalog/ProductGrid.tsx`**

```tsx
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border-subtle bg-surface-container-low py-16 text-center">
        <p className="font-headline-md text-headline-md text-on-surface">
          Tidak ada raket yang cocok
        </p>
        <p className="mt-2 font-body-md text-body-md text-secondary">
          Coba ubah atau hapus sebagian filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-gutter-grid md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

Kondisi kosong ini tidak ada di mockup — tanpanya, filter yang tak menghasilkan apa pun menampilkan halaman hampa yang terlihat seperti kerusakan.

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: tanpa error.

- [ ] **Step 4: Commit**

```bash
git add components/catalog/
git commit -m "feat: ProductCard dan ProductGrid dengan kondisi kosong"
```

---

### Task 7: Logika filter katalog

**Files:**
- Create: `lib/filter.ts`

**Interfaces:**
- Consumes: `Product`, `SortOption` dari `@/lib/types`
- Produces:
  - `type Filters = { query: string; brands: string[]; materials: string[]; weightRanges: number[]; priceMin: number | null; priceMax: number | null; sort: SortOption }`
  - `EMPTY_FILTERS: Filters`
  - `applyFilters(products: Product[], filters: Filters): Product[]`

Logika penyaringan dipisah dari komponen agar dapat diuji dan dibaca tanpa membaca JSX.

- [ ] **Step 1: Buat `lib/filter.ts`**

```ts
import type { Product, SortOption } from "./types";
import { WEIGHT_RANGES } from "./constants";

export type Filters = {
  query: string;
  brands: string[];
  materials: string[];
  /** Indeks ke WEIGHT_RANGES */
  weightRanges: number[];
  priceMin: number | null;
  priceMax: number | null;
  sort: SortOption;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  brands: [],
  materials: [],
  weightRanges: [],
  priceMin: null,
  priceMax: null,
  sort: "recommended",
};

export function applyFilters(products: Product[], f: Filters): Product[] {
  const q = f.query.trim().toLowerCase();

  const result = products.filter((p) => {
    if (q && !`${p.name} ${p.brand} ${p.material}`.toLowerCase().includes(q)) {
      return false;
    }
    if (f.brands.length > 0 && !f.brands.includes(p.brand)) return false;
    if (f.materials.length > 0 && !f.materials.includes(p.material)) {
      return false;
    }
    if (f.weightRanges.length > 0) {
      const cocok = f.weightRanges.some((i) => {
        const r = WEIGHT_RANGES[i];
        return p.specs.weightAvg >= r.min && p.specs.weightAvg < r.max;
      });
      if (!cocok) return false;
    }
    if (f.priceMin !== null && p.price < f.priceMin) return false;
    if (f.priceMax !== null && p.price > f.priceMax) return false;
    return true;
  });

  // Salin sebelum sort — Array.sort mengubah array di tempat, dan
  // `products` adalah array modul yang dipakai bersama.
  switch (f.sort) {
    case "price-asc":
      return [...result].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...result].sort((a, b) => b.price - a.price);
    case "newest":
      return [...result].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    default:
      return result;
  }
}
```

Komentar tentang salinan array itu penting: tanpa `[...result]`, mengurutkan akan mengubah urutan array modul secara permanen sehingga mode "Rekomendasi" tidak pernah kembali ke urutan asli.

- [ ] **Step 2: Verifikasi tipe**

Run: `npx tsc --noEmit`
Expected: tanpa keluaran.

- [ ] **Step 3: Uji cepat lewat Node**

```bash
npx tsx -e "
import { getAllProducts } from './lib/products';
import { applyFilters, EMPTY_FILTERS } from './lib/filter';
const all = getAllProducts();
console.log('total:', all.length);
console.log('JOOLA:', applyFilters(all, {...EMPTY_FILTERS, brands:['JOOLA']}).length);
console.log('termurah dulu:', applyFilters(all, {...EMPTY_FILTERS, sort:'price-asc'}).map(p=>p.price));
console.log('cari speedster:', applyFilters(all, {...EMPTY_FILTERS, query:'speedster'}).map(p=>p.name));
console.log('urutan asli utuh:', all.map(p=>p.id).join(','));
"
```

Expected:
```
total: 6
JOOLA: 2
termurah dulu: [ 1200000, 1650000, 1800000, 2500000, 2900000, 3100000 ]
cari speedster: [ 'PickleStock Speedster Pro' ]
urutan asli utuh: 1,2,3,4,5,6
```

Baris terakhir membuktikan penyortiran tidak merusak array asli. Bila `npx tsx` belum ada, npx akan mengunduhnya sementara.

- [ ] **Step 4: Commit**

```bash
git add lib/filter.ts
git commit -m "feat: logika filter dan urut katalog"
```

---

### Task 8: Sidebar filter dan CatalogView

**Files:**
- Create: `components/catalog/FilterSidebar.tsx`, `components/catalog/CatalogView.tsx`
- Modify: `app/page.tsx` (ganti seluruh isi)

**Interfaces:**
- Consumes: `Filters`, `EMPTY_FILTERS`, `applyFilters` dari `@/lib/filter`; `BRANDS`, `MATERIALS`, `WEIGHT_RANGES` dari `@/lib/constants`; `ProductGrid`; `TopNav`, `Footer`
- Produces: `<CatalogView products={products} />` (Client Component)

- [ ] **Step 1: Buat `components/catalog/FilterSidebar.tsx`**

```tsx
"use client";

import { BRANDS, MATERIALS, WEIGHT_RANGES } from "@/lib/constants";
import type { Filters } from "@/lib/filter";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <div className="hidden flex-col gap-6 md:flex">
      <div>
        <h3 className="mb-3 font-headline-sm text-headline-sm">Urutkan</h3>
        <select
          aria-label="Urutkan produk"
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as Filters["sort"] })
          }
          className="w-full cursor-pointer appearance-none rounded-input border-none bg-surface-input px-4 py-3 font-body-sm text-body-sm focus:ring-1 focus:ring-primary"
        >
          <option value="recommended">Rekomendasi</option>
          <option value="price-asc">Harga: Termurah</option>
          <option value="price-desc">Harga: Termahal</option>
          <option value="newest">Terbaru</option>
        </select>
      </div>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">Merek</legend>
        <div className="flex flex-col gap-3">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() =>
                  onChange({ ...filters, brands: toggle(filters.brands, brand) })
                }
                className="h-5 w-5 rounded border-border-subtle focus:ring-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">Bahan</legend>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((material) => {
            const active = filters.materials.includes(material);
            return (
              <button
                key={material}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({
                    ...filters,
                    materials: toggle(filters.materials, material),
                  })
                }
                className={`rounded-full px-3 py-1.5 font-body-sm text-body-sm transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "border border-border-subtle text-on-surface hover:border-primary"
                }`}
              >
                {material}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">Berat</legend>
        <div className="flex flex-col gap-3">
          {WEIGHT_RANGES.map((range, i) => (
            <label key={range.label} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.weightRanges.includes(i)}
                onChange={() =>
                  onChange({
                    ...filters,
                    weightRanges: toggle(filters.weightRanges, i),
                  })
                }
                className="h-5 w-5 rounded border-border-subtle focus:ring-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">
          Rentang Harga
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Harga minimum"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-btn border-none bg-surface-input px-3 py-2 text-center font-body-sm text-body-sm"
          />
          <span className="text-secondary">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Harga maksimum"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-btn border-none bg-surface-input px-3 py-2 text-center font-body-sm text-body-sm"
          />
        </div>
      </fieldset>
    </div>
  );
}
```

`<fieldset>`/`<legend>` dipakai agar pembaca layar mengumumkan judul grup saat fokus masuk ke checkbox — mockup memakai `<h3>` biasa yang tidak menyampaikan hubungan itu.

- [ ] **Step 2: Buat `components/catalog/CatalogView.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { applyFilters, EMPTY_FILTERS, type Filters } from "@/lib/filter";
import { BRANDS, MATERIALS } from "@/lib/constants";
import { FilterSidebar } from "./FilterSidebar";
import { ProductGrid } from "./ProductGrid";

export function CatalogView({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const visible = useMemo(
    () => applyFilters(products, filters),
    [products, filters],
  );

  const chips = [
    ...filters.brands.map((b) => ({ label: b, kind: "brand" as const })),
    ...filters.materials.map((m) => ({ label: m, kind: "material" as const })),
  ];

  function removeChip(chip: (typeof chips)[number]) {
    setFilters((f) =>
      chip.kind === "brand"
        ? { ...f, brands: f.brands.filter((b) => b !== chip.label) }
        : { ...f, materials: f.materials.filter((m) => m !== chip.label) },
    );
  }

  function toggleQuick(label: string) {
    const isBrand = (BRANDS as readonly string[]).includes(label);
    setFilters((f) => {
      const key = isBrand ? "brands" : "materials";
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(label)
          ? list.filter((v) => v !== label)
          : [...list, label],
      };
    });
  }

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-margin-page py-stack-section md:flex-row">
      <aside className="flex w-full flex-shrink-0 flex-col gap-6 md:w-64">
        {/* Pencarian + chip cepat — hanya mobile */}
        <div className="md:hidden">
          <div className="relative mb-4">
            <Search
              size={20}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-status-muted"
            />
            <input
              type="search"
              aria-label="Cari raket"
              placeholder="Cari raket, merek..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full rounded-input border-none bg-surface-input py-3 pl-10 pr-4 font-body-md text-body-md placeholder:text-status-muted focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
            {[...BRANDS, ...MATERIALS].map((label) => {
              const active =
                filters.brands.includes(label) ||
                filters.materials.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleQuick(label)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "border border-border-subtle bg-surface-pure text-on-surface"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <FilterSidebar filters={filters} onChange={setFilters} />
      </aside>

      <div className="flex flex-1 flex-col gap-6">
        {/* Judul + pencarian + chip aktif — hanya desktop */}
        <div className="hidden flex-col gap-4 md:flex">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-1 font-headline-lg text-headline-lg">
                Katalog Raket
              </h1>
              <p className="font-body-sm text-body-sm text-secondary">
                Menampilkan {visible.length} dari {products.length} raket.
              </p>
            </div>
            <div className="relative w-64">
              <Search
                size={20}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-status-muted"
              />
              <input
                type="search"
                aria-label="Cari raket"
                placeholder="Cari raket..."
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
                className="w-full rounded-input border-none bg-surface-input py-2 pl-10 pr-4 font-body-sm text-body-sm placeholder:text-status-muted focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={`${chip.kind}-${chip.label}`}
                  className="flex items-center gap-1 rounded-full bg-surface-input px-3 py-1 font-body-sm text-body-sm text-on-surface"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeChip(chip)}
                    aria-label={`Hapus filter ${chip.label}`}
                    className="transition-colors hover:text-error"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="ml-2 font-label-md text-body-sm text-primary hover:underline"
              >
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {/* Jumlah hasil — hanya mobile */}
        <p className="font-body-sm text-body-sm text-secondary md:hidden">
          Menampilkan {visible.length} hasil
        </p>

        <ProductGrid products={visible} />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Tulis ulang `app/page.tsx`**

```tsx
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getAllProducts } from "@/lib/products";

export default function Home() {
  const products = getAllProducts();

  return (
    <>
      <TopNav />
      <div className="pt-16">
        <CatalogView products={products} />
      </div>
      <Footer />
    </>
  );
}
```

Halaman tetap Server Component; hanya `CatalogView` yang dikirim ke browser sebagai JavaScript.

- [ ] **Step 4: Verifikasi build**

Run: `npm run build && npm run lint`
Expected: `✓ Compiled successfully`; rute `/` tercantum sebagai `○ (Static)`.

- [ ] **Step 5: Periksa manual di browser**

```bash
npm run dev
```

Buka `http://localhost:3000` dan pastikan:
- Grid menampilkan 6 kartu
- Mencentang "JOOLA" menyisakan 2 kartu, dan chip "JOOLA" muncul
- Mengetik "speedster" di pencarian menyisakan 1 kartu
- Mengubah urutan ke "Harga: Termurah" mengubah susunan
- Mengembalikan ke "Rekomendasi" memulihkan urutan awal (1–6)
- Filter yang tak menghasilkan apa pun menampilkan pesan "Tidak ada raket yang cocok"
- Lebar 375px: sidebar tersembunyi, baris chip dapat digulir
- Tab Network: tidak ada permintaan ke domain eksternal

Hentikan server dengan Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add components/catalog/ app/page.tsx
git commit -m "feat: halaman katalog dengan filter, pencarian, dan urutan"
```

---

### Task 9: Halaman detail produk

**Files:**
- Create: `components/product/ProductGallery.tsx`, `components/product/SpecGrid.tsx`, `components/product/ProductDetail.tsx`, `app/produk/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Product`; `formatRupiah`, `buildWhatsAppUrl`; `WHATSAPP_NUMBER`; `Badge`; `TopNav`, `Footer`; `getAllProducts`, `getProductBySlug`
- Produces: rute `/produk/[slug]`

- [ ] **Step 1: Buat `components/product/ProductGallery.tsx`**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="hide-scrollbar flex w-full shrink-0 gap-4 overflow-x-auto pb-2 md:w-24 md:flex-col md:overflow-visible md:pb-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat gambar ${i + 1} dari ${name}`}
              aria-current={i === active}
              className={`h-24 w-20 shrink-0 overflow-hidden rounded-btn border bg-surface-container-low transition-colors ${
                i === active ? "border-primary" : "border-border-subtle hover:border-outline-variant"
              }`}
            >
              <Image
                src={src}
                alt=""
                width={80}
                height={96}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-card border border-border-subtle bg-surface-container-low">
        <Image
          src={images[active]}
          alt={name}
          width={400}
          height={500}
          priority
          className="h-[80%] w-[80%] object-contain"
        />
      </div>
    </div>
  );
}
```

Thumbnail diberi `alt=""` karena gambar utama sudah membawa nama produk — mengulanginya membuat pembaca layar menyebut nama yang sama berkali-kali. Konteksnya sudah ada di `aria-label` tombol.

- [ ] **Step 2: Buat `components/product/SpecGrid.tsx`**

```tsx
import { Weight, Ruler, Grip, Layers } from "lucide-react";
import type { ProductSpecs } from "@/lib/types";

export function SpecGrid({ specs }: { specs: ProductSpecs }) {
  const items = [
    { Icon: Weight, label: "Berat", value: specs.weight },
    { Icon: Ruler, label: "Ketebalan", value: specs.thickness },
    { Icon: Grip, label: "Permukaan", value: specs.surface },
    { Icon: Layers, label: "Inti", value: specs.core },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 py-2">
      {items.map(({ Icon, label, value }) => (
        <div
          key={label}
          className="rounded-card border border-border-subtle bg-surface-input p-padding-card"
        >
          <Icon size={20} aria-hidden="true" className="mb-2 text-secondary" />
          <dt className="font-eyebrow text-eyebrow uppercase text-secondary">
            {label}
          </dt>
          <dd className="mt-1 font-label-md text-label-md text-on-surface">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

`<dl>`/`<dt>`/`<dd>` menggantikan `<p>` di mockup — pasangan label/nilai memang daftar definisi, dan pembaca layar mengumumkan hubungannya.

- [ ] **Step 3: Buat `components/product/ProductDetail.tsx`**

```tsx
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatRupiah, buildWhatsAppUrl } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "./ProductGallery";
import { SpecGrid } from "./SpecGrid";

export function ProductDetail({ product }: { product: Product }) {
  const ready = product.status === "ready";
  const waUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, product);
  const ctaLabel = ready ? "Pesan via WhatsApp" : "Pre-Order via WhatsApp";

  return (
    <>
      <main className="mx-auto max-w-7xl px-margin-page pb-32 pt-24 md:pb-12">
        <nav aria-label="Remah roti" className="mb-6">
          <ol className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Katalog
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li>
              <span className="text-secondary">{product.brand}</span>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li>
              <span className="text-on-surface" aria-current="page">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-stack-section md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-6 py-4 md:pl-8">
            <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
              <span className="font-eyebrow text-eyebrow uppercase tracking-widest text-secondary">
                {product.brand}
              </span>
              <h1 className="mt-1 font-headline-lg text-headline-lg text-on-surface">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-price-tag text-2xl text-on-surface">
                  {formatRupiah(product.price)}
                </span>
                <Badge status={product.status}>
                  {ready ? "Tersedia" : "Pre-Order"}
                </Badge>
              </div>
            </div>

            <SpecGrid specs={product.specs} />

            <div className="border-t border-border-subtle pt-4">
              <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">
                Tentang Produk
              </h2>
              <p className="font-body-md text-body-md leading-relaxed text-secondary">
                {product.description}
              </p>
            </div>

            {/* CTA desktop — versi mobile ada di bilah tetap di bawah */}
            <div className="mt-6 hidden flex-col gap-3 md:flex">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-inverse-surface"
              >
                <MessageCircle size={20} aria-hidden="true" />
                {ctaLabel}
              </a>
              <p className="text-center font-body-sm text-body-sm text-status-muted">
                Anda akan diarahkan ke WhatsApp untuk konfirmasi pesanan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bilah CTA tetap — hanya mobile */}
      <div className="pb-safe fixed bottom-0 z-50 w-full border-t border-border-subtle bg-surface-pure p-padding-card md:hidden">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-3.5 font-label-md text-label-md text-on-primary transition-transform active:scale-[0.98]"
        >
          <MessageCircle size={20} aria-hidden="true" />
          {ctaLabel}
        </a>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Buat `app/produk/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getAllProducts, getProductBySlug } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan — PickleStock" };

  return {
    title: `${product.name} — PickleStock`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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

`params` di-`await` — di Next.js 16 ia Promise. Melewatkan `await` menghasilkan error runtime, bukan error tipe yang jelas.

- [ ] **Step 5: Verifikasi build dan prerender**

Run: `npm run build`
Expected: `✓ Compiled successfully`, dan daftar rute memuat `● /produk/[slug]` dengan 6 halaman ter-generate.

- [ ] **Step 6: Periksa manual**

```bash
npm run dev
```

- `http://localhost:3000/produk/pro-pickleball-paddle-carbon-x` — tampil; klik thumbnail kedua mengganti gambar utama
- `http://localhost:3000/produk/tidak-ada` — menampilkan halaman 404
- Lebar 375px: bilah CTA menempel di bawah dan tidak menutupi konten
- Klik CTA membuka `wa.me` dengan pesan terisi
- `/produk/lite-speed-wave` (stok 0): CTA berbunyi "Pre-Order via WhatsApp"

Ctrl+C untuk berhenti.

- [ ] **Step 7: Commit**

```bash
git add components/product/ app/produk/
git commit -m "feat: halaman detail produk dengan galeri dan CTA WhatsApp"
```

---

### Task 10: Login admin

**Files:**
- Create: `components/admin/LoginForm.tsx`, `app/admin/login/page.tsx`

**Interfaces:**
- Consumes: `Input`, `Button`; `SITE_NAME`
- Produces: rute `/admin/login`

- [ ] **Step 1: Buat `components/admin/LoginForm.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: ganti dengan Supabase Auth (PRD §5.B.1).
    // Saat ini form apa pun diterima — tidak ada autentikasi sama sekali.
    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <div className="relative">
          <Mail
            size={20}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-status-muted"
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="admin@picklestock.com"
            className="w-full rounded-input border border-transparent bg-surface-input py-3 pl-12 pr-4 font-body-md text-body-md text-on-surface transition-colors placeholder:text-status-muted focus:border-border-subtle focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="sr-only">
          Kata sandi
        </label>
        <div className="relative">
          <Lock
            size={20}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-status-muted"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full rounded-input border border-transparent bg-surface-input py-3 pl-12 pr-12 font-body-md text-body-md text-on-surface transition-colors placeholder:text-status-muted focus:border-border-subtle focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-status-muted transition-colors hover:text-on-surface"
          >
            {showPassword ? (
              <EyeOff size={20} aria-hidden="true" />
            ) : (
              <Eye size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-border-subtle focus:ring-primary"
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Ingat saya
          </span>
        </label>
      </div>

      <Button type="submit" size="lg" fullWidth className="mt-4">
        Masuk ke Dashboard
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
```

Dua penyimpangan dari mockup di sini:
1. Tombol memakai `Button` varian `primary` (hitam/putih), bukan `bg-primary-container` + `text-on-primary-container` yang kontrasnya ±3,5:1 — di bawah ambang WCAG AA (penyimpangan #3).
2. Tautan "Lupa password?" dihapus — tidak ada alur pemulihan kata sandi, jadi ia hanya akan menjadi tautan mati.

- [ ] **Step 2: Buat `app/admin/login/page.tsx`**

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Masuk Admin — ${SITE_NAME}`,
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-level1 p-margin-page">
      <main className="w-full max-w-[400px]">
        <div className="flex flex-col gap-stack-section rounded-card border border-border-subtle bg-surface-pure p-6 shadow-card">
          <header className="flex flex-col gap-2 text-center">
            <h1 className="font-display-logo text-display-logo text-status-available">
              {SITE_NAME} Admin
            </h1>
            <p className="font-body-md text-body-md text-muted">
              Silakan masuk untuk mengelola stok &amp; produk.
            </p>
          </header>
          <LoginForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke Katalog Publik
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verifikasi**

Run: `npm run build && npm run lint`
Expected: tanpa error; rute `/admin/login` terdaftar.

- [ ] **Step 4: Periksa manual**

```bash
npm run dev
```

- `http://localhost:3000/admin/login` — kartu terpusat
- Ikon mata mengubah kata sandi menjadi terlihat, dan `aria-label`-nya ikut berubah
- Submit dengan email/sandi apa pun mengarah ke `/admin` (halaman ini dibuat di Task 11 — sebelum itu akan 404, ini wajar)

Ctrl+C untuk berhenti.

- [ ] **Step 5: Commit**

```bash
git add components/admin/ app/admin/
git commit -m "feat: halaman login admin (tanpa autentikasi, kontras diperbaiki)"
```

---

### Task 11: Modal form produk

**Files:**
- Create: `components/admin/ProductFormModal.tsx`

**Interfaces:**
- Consumes: `Product`; `BRANDS`, `MATERIALS`; `Button`
- Produces: `<ProductFormModal product={product | null} onClose={() => void} />` — `product` `null` berarti mode tambah.

- [ ] **Step 1: Buat `components/admin/ProductFormModal.tsx`**

```tsx
"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { X, Save, UploadCloud } from "lucide-react";
import type { Product } from "@/lib/types";
import { BRANDS, MATERIALS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

type Props = {
  /** null = tambah produk baru */
  product: Product | null;
  onClose: () => void;
};

export function ProductFormModal({ product, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Tutup dengan Escape, dan kunci gulir latar selama modal terbuka.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: simpan ke Supabase (PRD §5.B.2). Kini hanya menutup modal —
    // tidak ada yang tersimpan.
    onClose();
  }

  const labelClass = "mb-1.5 block font-label-md text-label-md text-on-surface";
  const fieldClass =
    "w-full rounded-btn border border-border-subtle bg-surface-input px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-surface-pure shadow-float outline-none"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 id="modal-title" className="font-headline-md text-headline-md">
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <div>
            <label htmlFor="f-name" className={labelClass}>
              Nama Produk
            </label>
            <input
              id="f-name"
              name="name"
              required
              defaultValue={product?.name ?? ""}
              placeholder="Pro Pickleball Paddle Carbon X"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-sku" className={labelClass}>
                SKU
              </label>
              <input
                id="f-sku"
                name="sku"
                required
                defaultValue={product?.sku ?? ""}
                placeholder="PDBL-CBX-01"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-brand" className={labelClass}>
                Merek
              </label>
              <select
                id="f-brand"
                name="brand"
                defaultValue={product?.brand ?? BRANDS[0]}
                className={fieldClass}
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-material" className={labelClass}>
                Bahan
              </label>
              <select
                id="f-material"
                name="material"
                defaultValue={product?.material ?? MATERIALS[0]}
                className={fieldClass}
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-price" className={labelClass}>
                Harga (Rp)
              </label>
              <input
                id="f-price"
                name="price"
                type="number"
                min={0}
                required
                defaultValue={product?.price ?? ""}
                placeholder="2500000"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="f-stock" className={labelClass}>
                Stok
              </label>
              <input
                id="f-stock"
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={product?.stock ?? 0}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-weight" className={labelClass}>
                Berat
              </label>
              <div className="relative">
                <input
                  id="f-weight"
                  name="weight"
                  defaultValue={product?.specs.weight ?? ""}
                  placeholder="7.8 - 8.2"
                  className={`${fieldClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-sm text-status-muted">
                  oz
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="f-thickness" className={labelClass}>
                Ketebalan Inti
              </label>
              <div className="relative">
                <input
                  id="f-thickness"
                  name="thickness"
                  defaultValue={product?.specs.thickness ?? ""}
                  placeholder="16"
                  className={`${fieldClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-sm text-status-muted">
                  mm
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="f-desc" className={labelClass}>
              Deskripsi Produk
            </label>
            <textarea
              id="f-desc"
              name="description"
              defaultValue={product?.description ?? ""}
              placeholder="Tuliskan deskripsi lengkap tentang fitur dan keunggulan raket..."
              className={`${fieldClass} min-h-[120px] resize-y`}
            />
          </div>

          <div>
            <span className={labelClass}>Gambar Produk</span>
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border-subtle bg-surface-input px-4 py-8 text-center">
              <UploadCloud size={28} aria-hidden="true" className="text-status-muted" />
              <p className="font-body-sm text-body-sm text-status-muted">
                Unggah gambar tersedia setelah Supabase Storage terpasang.
              </p>
            </div>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-subtle bg-surface-container-low px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="product-form">
            <Save size={16} aria-hidden="true" />
            Simpan Produk
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Catatan: tombol Simpan berada di luar `<form>` (di footer modal), jadi ia memakai atribut `form="product-form"` agar tetap memicu submit dan validasi HTML5. Area unggah gambar sengaja dibuat non-fungsional dan menyatakannya secara terbuka — tombol unggah yang diam saat diklik lebih membingungkan.

- [ ] **Step 2: Verifikasi tipe**

Run: `npx tsc --noEmit`
Expected: tanpa keluaran.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ProductFormModal.tsx
git commit -m "feat: modal tambah/edit produk"
```

---

### Task 12: Dashboard admin

**Files:**
- Create: `components/layout/AdminHeader.tsx`, `components/admin/ProductTable.tsx`, `app/admin/page.tsx`

**Interfaces:**
- Consumes: `Product`; `formatRupiah`; `WHATSAPP_NUMBER`, `SITE_NAME`; `Badge`, `Button`, `IconButton`; `ProductFormModal`; `Footer`; `getAllProducts`
- Produces: rute `/admin`

- [ ] **Step 1: Buat `components/layout/AdminHeader.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, LogOut } from "lucide-react";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function AdminHeader() {
  const [phone, setPhone] = useState(WHATSAPP_NUMBER);

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-margin-page backdrop-blur-md">
      <h1 className="font-display-logo text-display-logo tracking-tighter text-primary">
        {SITE_NAME} Admin
      </h1>

      {/* Pengaturan nomor WhatsApp — desktop */}
      <div className="mx-auto hidden max-w-md flex-1 items-center justify-center gap-2 md:flex">
        <Phone size={20} aria-hidden="true" className="text-secondary" />
        <label htmlFor="wa-desktop" className="sr-only">
          Nomor WhatsApp admin
        </label>
        <input
          id="wa-desktop"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 w-full rounded-input border border-border-subtle bg-surface-input px-4 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {/* TODO: simpan ke Supabase (PRD §5.B.3) */}
        <Button type="button" className="h-10 whitespace-nowrap">
          Simpan
        </Button>
      </div>

      <Link
        href="/admin/login"
        className="inline-flex items-center gap-2 rounded-btn border border-border-subtle px-3 py-2 font-label-md text-label-md text-secondary transition-colors hover:text-primary"
      >
        <LogOut size={18} aria-hidden="true" />
        <span className="hidden sm:inline">Keluar</span>
      </Link>
    </header>
  );
}
```

- [ ] **Step 2: Buat `components/admin/ProductTable.tsx`**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Phone } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ProductFormModal } from "./ProductFormModal";

type ModalState = { open: false } | { open: true; product: Product | null };

export function ProductTable({ products }: { products: Product[] }) {
  // Stok hanya hidup di state — semua perubahan hilang saat halaman dimuat
  // ulang. Ini disengaja sampai Supabase terpasang, bukan bug.
  const [stocks, setStocks] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((p) => [p.id, p.stock])),
  );
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [phone, setPhone] = useState(WHATSAPP_NUMBER);

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Manajemen Stok Produk
          </h2>
          <p className="mt-1 font-body-md text-body-md text-secondary">
            Kelola inventaris dan harga raket pickleball Anda.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setModal({ open: true, product: null })}
          className="whitespace-nowrap shadow-soft"
        >
          <Plus size={18} aria-hidden="true" />
          Tambah Produk Baru
        </Button>
      </div>

      {/* Pengaturan WhatsApp — mobile */}
      <div className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface-pure p-padding-card shadow-soft md:hidden">
        <label
          htmlFor="wa-mobile"
          className="flex items-center gap-2 font-label-md text-label-md text-on-surface"
        >
          <Phone size={16} aria-hidden="true" className="text-secondary" />
          Nomor WhatsApp Admin
        </label>
        <div className="flex gap-2">
          <input
            id="wa-mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 flex-1 rounded-input border border-border-subtle bg-surface-input px-4 font-body-sm text-body-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="button" className="h-10">
            Simpan
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-pure shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-low">
                <th scope="col" className="w-16 px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary">
                  Gambar
                </th>
                <th scope="col" className="px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary">
                  Detail Produk
                </th>
                <th scope="col" className="px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary">
                  Merek
                </th>
                <th scope="col" className="px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary">
                  Harga
                </th>
                <th scope="col" className="w-24 px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary">
                  Stok
                </th>
                <th scope="col" className="px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary">
                  Status
                </th>
                <th scope="col" className="px-padding-card py-3 text-right font-eyebrow text-eyebrow uppercase text-secondary">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map((product) => {
                const stock = stocks[product.id];
                const ready = stock > 0;
                return (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-padding-card py-4">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-btn border border-border-subtle bg-surface-input">
                        <Image
                          src={product.images[0]}
                          alt=""
                          width={48}
                          height={48}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-padding-card py-4">
                      <div className="font-headline-sm text-headline-sm text-on-surface">
                        {product.name}
                      </div>
                      <div className="mt-0.5 font-body-sm text-body-sm text-secondary">
                        SKU: {product.sku}
                      </div>
                    </td>
                    <td className="px-padding-card py-4 font-body-sm text-body-sm text-on-surface">
                      {product.brand}
                    </td>
                    <td className="px-padding-card py-4 font-price-tag text-price-tag text-on-surface">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-padding-card py-4">
                      <label htmlFor={`stok-${product.id}`} className="sr-only">
                        Stok {product.name}
                      </label>
                      <input
                        id={`stok-${product.id}`}
                        type="number"
                        min={0}
                        value={stock}
                        onChange={(e) =>
                          setStocks((s) => ({
                            ...s,
                            [product.id]: Math.max(0, Number(e.target.value)),
                          }))
                        }
                        className="w-full rounded-btn border border-border-subtle bg-surface-input px-2 py-1 text-center font-body-md text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-padding-card py-4">
                      <Badge status={ready ? "ready" : "preorder"}>
                        {ready ? "Ready Stock" : "Pre-Order"}
                      </Badge>
                    </td>
                    <td className="px-padding-card py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <IconButton
                          label={`Edit ${product.name}`}
                          onClick={() => setModal({ open: true, product })}
                        >
                          <Pencil size={20} aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Hapus ${product.name}`}
                          className="hover:bg-error-container hover:text-error"
                        >
                          <Trash2 size={20} aria-hidden="true" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle bg-surface-container-low p-padding-card">
          <span className="font-body-sm text-body-sm text-secondary">
            Menampilkan {products.length} dari {products.length} produk
          </span>
          <div className="flex gap-2">
            {/* Paginasi menyusul bersama Supabase; mockup pun menggambarkannya mati */}
            <Button variant="secondary" size="sm" disabled>
              Sebelumnya
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Berikutnya
            </Button>
          </div>
        </div>
      </div>

      {modal.open && (
        <ProductFormModal
          product={modal.product}
          onClose={() => setModal({ open: false })}
        />
      )}
    </>
  );
}
```

`focus-within:opacity-100` ditambahkan pada baris aksi — di mockup tombol hanya muncul saat hover, yang membuatnya mustahil dijangkau lewat keyboard.

- [ ] **Step 3: Buat `app/admin/page.tsx`**

```tsx
import type { Metadata } from "next";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { ProductTable } from "@/components/admin/ProductTable";
import { getAllProducts } from "@/lib/products";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Dashboard Admin — ${SITE_NAME}`,
};

export default function AdminPage() {
  const products = getAllProducts();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AdminHeader />
      <main className="mx-auto mt-16 flex w-full max-w-[1200px] flex-1 flex-col gap-stack-section px-margin-page py-stack-section">
        <ProductTable products={products} />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Verifikasi build**

Run: `npm run build && npm run lint`
Expected: tanpa error; rute `/admin` terdaftar.

- [ ] **Step 5: Periksa manual**

```bash
npm run dev
```

`http://localhost:3000/admin`:
- Tabel menampilkan 6 produk
- Mengubah stok baris pertama menjadi `0` mengubah lencananya menjadi "Pre-Order"
- "Tambah Produk Baru" membuka modal berjudul "Tambah Produk Baru"
- Tombol pensil membuka modal berjudul "Edit Produk" dengan field terisi
- Escape menutup modal; klik latar gelap juga
- Selagi modal terbuka, latar belakang tidak dapat digulir
- Tab keyboard menampilkan tombol edit/hapus meski tanpa hover
- Lebar 375px: kartu pengaturan WhatsApp muncul, tabel dapat digulir horizontal

Ctrl+C untuk berhenti.

- [ ] **Step 6: Commit**

```bash
git add components/layout/AdminHeader.tsx components/admin/ProductTable.tsx app/admin/page.tsx
git commit -m "feat: dashboard admin dengan tabel produk dan modal"
```

---

### Task 13: Verifikasi menyeluruh

**Files:** tidak ada perubahan kode kecuali ada temuan.

- [ ] **Step 1: Build bersih dari nol**

```bash
rm -rf .next && npm run build
```
Expected: `✓ Compiled successfully`. Rute yang harus muncul: `/`, `/produk/[slug]` (6 halaman), `/admin`, `/admin/login`, `/_not-found`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: tanpa keluaran.

- [ ] **Step 3: Pastikan tidak ada sisa rujukan eksternal**

```bash
grep -rn "lh3.googleusercontent\|cdn.tailwindcss\|fonts.googleapis\|material-symbols" app/ components/ lib/ || echo "BERSIH"
```
Expected: `BERSIH`

- [ ] **Step 4: Pastikan tidak ada varian dark: yang tersisa**

```bash
grep -rn "dark:" app/ components/ || echo "BERSIH"
```
Expected: `BERSIH`

- [ ] **Step 5: Pastikan setiap tombol ikon punya nama**

```bash
grep -rn "<button" components/ app/ | grep -v "aria-label" | grep -v "IconButton"
```
Periksa hasilnya: setiap baris yang muncul harus berupa tombol dengan teks terlihat (mis. "Batal", "Simpan Produk"). Tombol yang isinya hanya ikon wajib punya `aria-label`.

- [ ] **Step 6: Uji manual lintas halaman**

```bash
npm run dev
```

Telusuri alur lengkap pada lebar 375px lalu 1440px:
1. `/` → filter merek → klik kartu → halaman detail
2. Detail → klik "Katalog" di remah roti → kembali ke katalog
3. `/` → ikon orang di kanan atas → `/admin/login`
4. Login → submit → `/admin`
5. `/admin` → tambah produk → Escape → edit produk → Batal
6. `/admin` → "Keluar" → kembali ke `/admin/login`

Di tab Network, saring `Fetch/XHR` dan `Img`: seluruh permintaan harus menuju `localhost`.

- [ ] **Step 7: Perbarui AGENTS.md dengan catatan design system**

Tambahkan di akhir `AGENTS.md`:

```markdown

## Design system

Token berada di `app/globals.css` dalam blok `@theme` (Tailwind v4) —
diterjemahkan dari `D:\Projects\PickleStock\Stitch AI\picklestock\DESIGN.md`.
Ubah warna dan tipografi di sana, jangan menulis nilai hex langsung di komponen.

Mockup asli (`Stitch AI/*/code.html`) memakai Tailwind v3 via CDN dan **bukan
rujukan yang bisa disalin apa adanya**. Penyimpangan yang disengaja beserta
alasannya tercatat di
`docs/superpowers/specs/2026-07-31-integrasi-design-stitch-design.md`.

Data produk berasal dari `lib/products.ts`. Saat Supabase masuk, file itulah
satu-satunya yang perlu diganti — komponen tampilan tidak menyentuh sumber data.
```

- [ ] **Step 8: Commit akhir**

```bash
git add AGENTS.md
git commit -m "docs: catatan design system dan sumber data di AGENTS.md"
```

---

## Ringkasan verifikasi

| Kebutuhan spec | Task |
|---|---|
| Token `@theme` Tailwind v4 | 1 |
| Font Plus Jakarta Sans + Inter self-hosted | 1 |
| Tipe `Product` dengan `weightAvg`, `createdAt` | 2 |
| `formatRupiah`, `buildWhatsAppUrl` dua varian (PRD §5.A.4) | 2 |
| Placeholder SVG lokal | 3 |
| Primitif UI | 4 |
| TopNav, Footer (tanpa BottomNav — penyimpangan #11) | 5 |
| Kartu produk + kondisi kosong | 6 |
| Filter merek/bahan/berat/harga, pencarian, urutan | 7, 8 |
| Katalog responsif satu komponen | 8 |
| Detail produk + galeri + `generateStaticParams` | 9 |
| 404 untuk slug tak dikenal | 9 |
| Login admin, kontras diperbaiki (penyimpangan #3) | 10 |
| Modal tambah/edit, Escape, kunci gulir | 11 |
| Dashboard admin, edit stok, pengaturan WhatsApp | 12 |
| Tanpa permintaan eksternal | 13 |
| Tanpa varian `dark:` | 13 |
