# Monitoring dan keamanan gratis

PickleStock menggunakan fasilitas yang tersedia di Supabase Free dan Vercel
Hobby. Konfigurasi ini tidak membutuhkan domain custom atau layanan monitoring
berbayar.

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
