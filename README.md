# PickleStock

Katalog raket pickleball dengan dashboard admin untuk mengelola produk, stok,
gambar Supabase Storage, dan nomor WhatsApp tujuan pemesanan.

## Stack

- Next.js 16 App Router + React 19
- Tailwind CSS v4
- Supabase Database, Auth, dan Storage
- Vitest untuk unit/regression test

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Jalankan SQL berikut di Supabase SQL Editor secara berurutan:
   - `docs/supabase/schema.sql` untuk instalasi baru; atau
   - `docs/supabase/crud-storage.sql` dan
     `docs/supabase/whatsapp-settings.sql` untuk database lama.
4. Buat akun admin melalui Supabase Authentication dengan Auto Confirm aktif.
5. Jalankan aplikasi:

```bash
npm install
npm run dev
```

Katalog tersedia di `http://localhost:3000` dan dashboard di
`http://localhost:3000/admin`.

## Pemeriksaan kualitas

```bash
npm run check
```

Perintah tersebut menjalankan TypeScript, ESLint, 19 test otomatis, dan build
produksi. Detail deployment dan smoke test tersedia di
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Keamanan

- Katalog dan pengaturan WhatsApp hanya dapat dibaca publik.
- Semua mutation memverifikasi user Supabase di Server Action.
- RLS membatasi tulis produk, pengaturan, dan Storage ke role `authenticated`.
- Aplikasi tidak menyediakan registrasi mandiri; akun admin dibuat manual.
- Gambar dibatasi JPG/PNG/WebP, maksimal empat file dan 5 MB per file.
