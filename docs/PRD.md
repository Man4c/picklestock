\# Product Requirement Document (PRD)



\## 1. Document Overview

\* \*\*Product Name:\*\* PickleStock

\* \*\*Type:\*\* Web Application (Responsive Web)

\* \*\*Document Version:\*\* 1.1 (Final Draft)

\* \*\*Status:\*\* Ready for Development



\---



\## 2. Product Summary \& Goal

\*\*PickleStock\*\* adalah aplikasi berbasis web yang dirancang untuk memudahkan pelanggan mengecek ketersediaan stok raket pickleball (\*paddle\*) secara \*real-time\*. Sistem dilengkapi katalog interaktif, filter pencarian lengkap, opsi Pre-Order saat stok habis, halaman admin untuk pengelolaan data, serta integrasi tombol pemesanan langsung ke WhatsApp.



\---



\## 3. Tech Stack Recommendation (Free Tier Friendly)

\* \*\*Frontend Framework:\*\* Next.js (Hosted on Vercel Free Tier)

\* \*\*Backend \& Database:\*\* Supabase (PostgreSQL, Storage for Images, Auth)

\* \*\*Styling:\*\* Tailwind CSS



\---



\## 4. Target User \& Persona



1\. \*\*Pelanggan / Pemain Pickleball (End User)\*\*

&#x20;  \* Membutuhkan informasi stok raket pickleball dengan cepat dan akurat.

&#x20;  \* Ingin memfilter raket sesuai preferensi (brand, bahan, berat, harga).

&#x20;  \* Ingin langsung memesan atau melakukan \*Pre-Order\* via WhatsApp.



2\. \*\*Admin / Pemilik Toko (Internal User)\*\*

&#x20;  \* Membutuhkan antarmuka yang mudah digunakan untuk manajemen stok (CRUD).

&#x20;  \* Mengatur status barang (\*Ready Stock\* atau \*Pre-Order\*).



\---



\## 5. Feature Requirements \& Scope



\### A. Customer-Facing Features (Public Web)

1\. \*\*Katalog Raket \& Status Stok\*\*

&#x20;  \* Menampilkan daftar raket (Foto, Nama, Brand, Spesifikasi, Harga).

&#x20;  \* Indikator status stok: \*\*Tersedia\*\* (Stok > 0) atau \*\*Pre-Order / Habis\*\* (Stok = 0).

2\. \*\*Pencarian \& Filter Lengkap\*\*

&#x20;  \* \*Search Bar\*: Pencarian berdasarkan nama produk atau tipe.

&#x20;  \* \*Filter\*: Berdasarkan Merek (Brand), Bahan (\*Carbon Fiber\*, \*Fiberglass\*, dll.), Berat Raket, dan Rentang Harga.

&#x20;  \* \*Sorting\*: Urutkan berdasarkan Harga (Termurah/Termahal), Terpopuler, atau Terbaru.

3\. \*\*Detail Produk\*\*

&#x20;  \* Menampilkan deskripsi lengkap raket, spesifikasi, dan galeri gambar.

4\. \*\*Integrasi WhatsApp (Order \& Pre-Order)\*\*

&#x20;  \* Tombol aksi utama mengarah ke WhatsApp admin.

&#x20;  \* \*\*Format Pesan Otomatis:\*\*

&#x20;    > \*"Halo Admin, saya mau pesan raket \[Nama Produk] (Rp \[Harga Produk]). Apakah stoknya masih ada?"\*

&#x20;  \* Jika stok 0, tombol berubah menjadi \*\*"Pre-Order via WhatsApp"\*\* dengan format pesan khusus Pre-Order.



\### B. Admin Panel Features (Internal Management)

1\. \*\*Autentikasi Admin\*\*

&#x20;  \* \*Login\* \& \*Logout\* khusus admin via Supabase Auth.

2\. \*\*Manajemen Produk (CRUD)\*\*

&#x20;  \* \*\*Create:\*\* Menambah data raket (Upload gambar ke Supabase Storage, nama, brand, harga, deskripsi, spesifikasi, dan jumlah stok).

&#x20;  \* \*\*Read:\*\* Melihat daftar produk beserta sisa stoknya.

&#x20;  \* \*\*Update:\*\* Memperbarui data raket dan jumlah stok.

&#x20;  \* \*\*Delete:\*\* Menghapus data produk dari katalog.

3\. \*\*Pengaturan Nomor WhatsApp\*\*

&#x20;  \* Mengatur nomor WhatsApp tujuan pengiriman pesan pesanan.



\---



\## 6. User Flow



\### Flow Pelanggan

1\. Pelanggan membuka URL web \*\*PickleStock\*\*.

2\. Pelanggan mencari/memfilter raket pilihan.

3\. Pelanggan membuka halaman detail produk.

4\. Pelanggan mengeklik tombol \*\*"Pesan via WhatsApp"\*\* (atau \*"Pre-Order via WhatsApp"\* jika stok 0).

5\. Sistem membuka WhatsApp dengan format pesan otomatis terisi rincian nama produk dan harga.



\### Flow Admin

1\. Admin mengakses `/admin` dan melakukan \*Login\*.

2\. Admin mengelola produk (tambah/edit stok).

3\. Jika stok diubah menjadi `0`, status produk di katalog web otomatis menjadi \*Pre-Order\*.



\---



\## 7. Non-Functional Requirements

\* \*\*Responsive Design:\*\* Tampilan fleksibel untuk HP, Tablet, dan Laptop.

\* \*\*Fast Performance:\*\* Optimasi gambar raket menggunakan Next.js Image Optimization.

\* \*\*Cost Efficiency:\*\* Berjalan 100% pada \*Free Tier\* Vercel dan Supabase.



\---



\## 8. Out of Scope (v1.0)

\* Payment Gateway \& Direct Web Checkout.

\* Akun pelanggan (pengguna tidak perlu login untuk melihat stok atau pesan).

