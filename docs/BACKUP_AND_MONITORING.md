# Backup dan monitoring gratis

PickleStock menggunakan fasilitas yang tersedia di Supabase Free, Vercel Hobby,
dan GitHub Actions. Konfigurasi ini tidak membutuhkan domain custom atau layanan
monitoring berbayar.

## Backup database

Supabase Free tidak menyediakan backup otomatis yang dapat dipulihkan dari
dashboard. Workflow `.github/workflows/backup.yml` menjalankan logical dump
setiap hari pukul 02.17 WITA dan menyimpannya sebagai GitHub Actions artifact
selama 30 hari.

Tambahkan repository secret bernama `SUPABASE_DB_URL` di GitHub:

1. Buka **Settings → Secrets and variables → Actions**.
2. Buat **New repository secret** bernama `SUPABASE_DB_URL`.
3. Isi dengan direct database connection string dari Supabase **Connect**.
4. Buka **Actions → Backup Supabase → Run workflow** untuk pengujian pertama.
5. Pastikan artifact berisi `roles.sql`, `schema.sql`, dan `data.sql`.

Jangan menaruh connection string di `.env.local`, Vercel, source code, atau log.
Artifact hanya dapat diunduh oleh pengguna GitHub yang memiliki akses ke repo.

### Pemulihan

Unduh artifact terbaru, buat project Supabase tujuan, lalu ikuti prosedur restore
resmi Supabase. Selalu uji restore ke project sementara lebih dahulu. File dump
dapat mengandung data pelanggan dan wajib diperlakukan sebagai data rahasia.

## Security Advisor

Security Advisor Supabase berjalan otomatis. Setelah setiap perubahan skema:

1. Buka **Database → Advisors → Security Advisor**.
2. Pilih **Rerun linter**.
3. Selesaikan temuan `ERROR` dan `WARN` yang relevan.
4. Pastikan tabel `products`, `site_settings`, dan `orders` memiliki RLS aktif.

Pada paket Free, warning **Leaked Password Protection Disabled** tidak dapat
diselesaikan karena perlindungan tersebut hanya tersedia mulai paket Pro.
Gunakan kata sandi admin yang panjang dan unik, password manager, serta jangan
gunakan ulang kata sandi. Setelah `security-hardening.sql` diterapkan, warning
listing bucket dan fungsi `SECURITY DEFINER` di schema publik seharusnya hilang.

## Monitoring error

- `instrumentation.ts` mengirim error server sebagai JSON terstruktur ke Runtime
  Logs Vercel. Query string, header, dan isi form tidak dicatat agar nomor telepon
  pelanggan tidak bocor.
- `app/error.tsx` memberi fallback dan tombol coba ulang untuk error rendering.
- Runtime Logs tersedia di **Vercel → Project → Logs**. Pada Hobby, retensinya
  singkat; periksa segera ketika masalah dilaporkan.
- Log database dan API tersedia di **Supabase → Logs Explorer**.
- Alert otomatis Vercel tidak tersedia pada paket gratis. Pemeriksaan manual log
  setelah deploy dan saat ada laporan pengguna tetap diperlukan.

Checklist setelah deploy:

- Buka katalog dan detail produk.
- Login admin, simpan produk, lalu catat dan ubah status pesanan.
- Periksa Vercel Runtime Logs dan Supabase Logs Explorer; tidak boleh ada error.
- Rerun Security Advisor setelah migration baru.
