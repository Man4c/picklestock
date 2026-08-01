# Filter Bottom Sheet — Mobile & Tablet

**Tanggal:** 2026-08-01
**Status:** Disetujui (semua keputusan desain ditetapkan pengguna)

## Masalah

Filter **Berat**, **Rentang Harga**, dan **Urutkan** hanya ada di `FilterSidebar`,
yang tersembunyi di bawah `lg` (1024px). Di HP & tablet ketiganya tidak dapat
diakses sama sekali — melanggar PRD §5.A.2 ("Filter Lengkap") dan §7 (responsif
untuk HP, Tablet, Laptop). Chip cepat yang ada hanya menutup merek + bahan.

## Keputusan desain (ditetapkan pengguna)

1. **Bentuk:** bottom sheet (naik dari bawah).
2. **Chip cepat:** dipertahankan; tambahkan tombol "Filter" + "Urutkan".
3. **Penerapan:** live — perubahan langsung memfilter daftar (konsisten dengan
   sidebar desktop yang juga live).
4. **Reuse:** pakai ulang `FilterSidebar` di dalam sheet (Opsi A) — nol duplikasi.

## Arsitektur

`FilterSidebar` sudah murni (menerima `filters` + `onChange`, tanpa state
internal), sehingga dapat dipakai ulang langsung. Cangkang sheet mengikuti pola
`ProductFormModal` (overlay `bg-black/40`, klik-luar & Escape menutup, kunci
scroll body, fokus panel).

### File

**`components/catalog/FilterSheet.tsx` (BARU)** — cangkang bottom sheet.
- Props: `{ filters: Filters; onChange: (f: Filters) => void; resultCount: number; onClose: () => void }`
- Struktur: overlay + panel `rounded-t-card max-h-[85vh]` menempel ke bawah.
- Header (sticky): judul "Filter", subteks "{resultCount} hasil", tombol Reset
  (set `EMPTY_FILTERS`) + tombol tutup (X).
- Body (scroll): `<FilterSidebar filters onChange />`.
- Footer (sticky): tombol lebar "Lihat {resultCount} hasil" → `onClose`
  (menutup, bukan menerapkan — filter sudah live).
- Perilaku: Escape menutup, klik overlay menutup, `document.body.style.overflow
  = "hidden"` selama terbuka, fokus ke panel saat mount.

**`components/catalog/FilterSidebar.tsx` (UBAH)** — ganti pembungkus
`hidden lg:flex` → `flex`. Visibilitas kini urusan pemanggil. Tak ada perubahan
lain; seluruh kontrol tetap.

**`components/catalog/CatalogView.tsx` (UBAH)**
- Bungkus `<FilterSidebar>` desktop dengan `<div className="hidden lg:block">`
  agar tetap tersembunyi di bawah `lg` (kompensasi hilangnya `hidden lg:flex`).
- Tambah state `const [sheetOpen, setSheetOpen] = useState(false)`.
- Di area mobile/tablet (`lg:hidden`), di bawah baris chip, tambah dua tombol:
  - "Filter" (ikon `SlidersHorizontal`) → `setSheetOpen(true)`. Tampilkan badge
    jumlah filter aktif bila > 0.
  - "Urutkan" (ikon `ArrowUpDown`) → juga membuka sheet (Urutkan ada di dalam
    FilterSidebar). Alternatif sederhana: satu tombol "Filter & Urutkan".
    → **Keputusan:** dua tombol terpisah, keduanya membuka sheet yang sama,
    demi kejelasan afinitas visual dengan mockup.
- Render `{sheetOpen && <FilterSheet ... onClose={() => setSheetOpen(false)} />}`.

### Hitung filter aktif

Badge pada tombol "Filter" = jumlah kriteria aktif:
`brands.length + materials.length + weightRanges.length +
(priceMin !== null ? 1 : 0) + (priceMax !== null ? 1 : 0)`.
(query & sort tidak dihitung — query punya kotak sendiri, sort punya tombolnya.)

## Aksesibilitas

- Panel: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- Tombol pemicu: `aria-expanded`, `aria-haspopup="dialog"`.
- Tombol tutup & reset: `aria-label` jelas.
- Escape & fokus ditangani seperti `ProductFormModal`.

## Non-goal

- Animasi kompleks (cukup transisi transform bawaan; boleh tanpa animasi masuk
  jika menambah kerumitan).
- Draft/terapkan manual — dikesampingkan; filter live.
- Perubahan pada perilaku sidebar desktop.

## Verifikasi

- `tsc --noEmit` + `eslint` bersih.
- Screenshot Playwright: 390px (HP) & 820px (tablet) — sheet terbuka menampilkan
  semua filter; badge jumlah aktif benar; daftar ter-update live; 1280px desktop
  tak berubah.
