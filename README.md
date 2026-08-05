# PickleStock

Katalog raket pickleball dengan dashboard admin untuk mengelola produk, stok,
gambar Supabase Storage, nomor WhatsApp tujuan pemesanan, serta catatan pesanan
dan penjualan.

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
     `docs/supabase/whatsapp-settings.sql`, lalu
     `docs/supabase/admin-authorization.sql` dan
     `docs/supabase/orders-sales.sql`, lalu
     `docs/supabase/security-hardening.sql` untuk database lama.
4. Buat akun melalui Supabase Authentication dengan Auto Confirm aktif, lalu
   tambahkan UUID akun tersebut ke `public.admin_users` (lihat migration).
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

Perintah tersebut menjalankan TypeScript, ESLint, test otomatis, dan build
produksi. Detail deployment dan smoke test tersedia di
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Panduan backup gratis, Security
Advisor, dan log produksi tersedia di
[`docs/BACKUP_AND_MONITORING.md`](docs/BACKUP_AND_MONITORING.md).

## Keamanan

- Katalog dan pengaturan WhatsApp hanya dapat dibaca publik.
- Semua mutation memverifikasi sesi Supabase dan keanggotaan `admin_users`.
- RLS memakai `is_admin()` untuk membatasi tulis produk, pengaturan, pesanan,
  dan Storage. Catatan pesanan tidak dapat dibaca pengguna anonim.
- Aplikasi tidak menyediakan registrasi mandiri; akun dan akses admin diberikan
  secara terpisah agar akun Auth biasa tidak memperoleh akses dashboard.
- Gambar dibatasi JPG/PNG/WebP, maksimal empat file dan 5 MB per file.
