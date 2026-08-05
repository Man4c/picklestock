# Deployment PickleStock

## 1. Supabase

Untuk project baru, jalankan `docs/supabase/schema.sql`. Untuk project yang
sudah memiliki tabel produk, jalankan migration berikut:

1. `docs/supabase/crud-storage.sql`
2. `docs/supabase/whatsapp-settings.sql`

Pastikan:

- bucket `product-images` bersifat public;
- anon hanya dapat membaca tabel dan gambar;
- authenticated dapat menulis produk, pengaturan WhatsApp, dan gambar;
- akun admin dibuat melalui Authentication → Add user → Auto Confirm.

## 2. Environment Vercel

Tambahkan untuk Production, Preview, dan Development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Jangan menambahkan service-role key atau kredensial akun admin ke aplikasi.

## 3. GitHub dan Vercel

1. Hubungkan repository `Man4c/picklestock` ke Vercel.
2. Framework preset: Next.js; build command: `npm run build`.
3. Tambahkan dua environment variable Supabase di atas.
4. Deploy branch `main`.

Untuk mengaktifkan CI GitHub, tambahkan repository secrets
`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Smoke test produksi

- Katalog `/` menampilkan seluruh produk dan gambar.
- Filter, pencarian, urutan, dan detail produk bekerja di ponsel/tablet/desktop.
- `/admin` mengalihkan pengunjung tanpa sesi ke login.
- Login admin berhasil; pesan error login tetap generik.
- Create, edit, update stok, dan delete memperbarui katalog.
- Upload menolak format selain JPG/PNG/WebP dan file di atas 5 MB.
- Delete produk menghapus objek terkait dari Storage.
- Nomor WhatsApp dapat disimpan dari admin dan dipakai pada CTA katalog/detail.
- Logout mengakhiri sesi dan melindungi kembali `/admin`.

## 5. Pemulihan

Database dan Storage adalah sumber data utama. Aktifkan backup sesuai paket
Supabase yang digunakan, dan simpan migration SQL di repository. Jika deploy
bermasalah, rollback ke deployment Vercel sebelumnya; jangan menghapus tabel
atau bucket ketika melakukan rollback aplikasi.
