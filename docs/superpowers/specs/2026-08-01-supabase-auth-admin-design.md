# Supabase — Sub-proyek #2: Auth Admin

**Tanggal:** 2026-08-01
**Status:** Disetujui (keputusan desain ditetapkan pengguna)
**Bagian dari:** Integrasi Supabase (3 sub-proyek berurutan)
**Bergantung pada:** #1 (katalog dinamis) — selesai.

## Konteks

Sub-proyek kedua dari integrasi Supabase. #1 membuat katalog membaca dari DB.
Spec ini menambah **autentikasi admin nyata**: login, logout, dan proteksi
route `/admin/*`. Saat ini `LoginForm` menerima input apa pun dan
`router.push("/admin")` tanpa autentikasi; `/admin` terbuka bagi siapa saja;
tombol "Keluar" hanya `<Link>` ke halaman login (tak mengakhiri sesi).

## Masalah

PRD §5.B.1 mensyaratkan login & logout admin via Supabase Auth. Tanpa ini,
panel admin (dan nanti CRUD di #3) tak terlindungi.

## Keputusan desain (ditetapkan pengguna)

1. **Pembuatan akun:** manual via dashboard Supabase (Authentication → Add user).
   TIDAK ada halaman signup di aplikasi — hanya form login. Aman untuk toko
   dengan 1-2 admin.
2. **Proteksi route:** middleware mencegat `/admin/*`. Belum login → dialihkan
   ke `/admin/login`. `/admin/login` tetap publik. Sudah login lalu buka
   `/admin/login` → dialihkan ke `/admin`.
3. **Pola teknis:** login & logout sebagai **Server Actions** Next.js (bukan
   route handler). Idiomatik App Router, ringkas, cocok dengan `@supabase/ssr`.

## Arsitektur

### File

**`lib/supabase/proxy.ts` (BARU)** — helper `updateSession(request)`:
- Membuat client Supabase untuk konteks proxy (pola `@supabase/ssr`:
  `getAll` dari `request.cookies`, `setAll` menulis ke `request.cookies` DAN
  `response.cookies` agar token refresh tersimpan).
- Memanggil `supabase.auth.getUser()` — memvalidasi token ke server Supabase
  (BUKAN `getSession()` yang hanya baca cookie & bisa dipalsukan).
- Logika redirect (urutan penting — cek `/admin/login` DULU untuk hindari loop):
  - **KRITIS:** `/admin/login` route nested di bawah `/admin`
    (`app/admin/login/page.tsx`), jadi matcher `/admin/:path*` ikut mencegatnya.
    Cek `pathname === "/admin/login"` HARUS didahulukan; bila tidak, "belum
    login buka /admin/login → redirect ke /admin/login" jadi loop tak berujung.
  - `pathname === "/admin/login"`:
    - ADA user → redirect `/admin`.
    - TAK ada user → lanjut (tampilkan form login). JANGAN redirect.
  - `pathname` diawali `/admin` (selain di atas) & TAK ada user → redirect
    `/admin/login`.
  - Selain itu → lanjut (`response`).
- Bila client gagal dibuat (env hilang) → gagal aman: redirect `/admin/login`
  untuk semua `/admin/*` (jangan buka panel bila auth tak dapat diverifikasi).
- Mengembalikan `response` (NextResponse) dengan cookie yang benar.

**`proxy.ts` (BARU, root proyek)** — entry Proxy Next.js 16.
> **PENTING (Next 16):** file convention `middleware.ts` DEPRECATED, diganti
> `proxy.ts` dengan fungsi bernama `proxy` (bukan `middleware`). Verifikasi via
> `node_modules/next/dist/docs/.../file-conventions/proxy.md`. Proxy default ke
> runtime Node.js di v16 — cocok untuk Supabase.
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
```
Matcher hanya `/admin/*` — route publik (katalog) tak terbebani.
Catatan keamanan (dari docs): Server Actions ditangani sebagai POST ke route
tempat dipakainya, sehingga matcher yang meliputi `/admin/*` juga meliputi
action di `/admin/login`. Namun docs menegaskan verifikasi auth tetap harus di
dalam tiap Server Function, bukan mengandalkan Proxy saja — memperkuat
defense-in-depth di `app/admin/page.tsx`.

**`app/admin/actions.ts` (BARU)** — Server Actions (`"use server"`):
```ts
export async function login(
  prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }>   // atau redirect saat sukses

export async function logout(): Promise<void>  // signOut lalu redirect
```
- `login`: ambil `email`/`password` dari formData; validasi tak kosong;
  `supabase.auth.signInWithPassword()`. Error → return `{ error: <pesan> }`.
  Sukses → `revalidatePath("/admin", "layout")` lalu `redirect("/admin")`.
- `logout`: `supabase.auth.signOut()` → `redirect("/admin/login")`.

**`components/admin/LoginForm.tsx` (UBAH)** — pakai `useActionState`:
- Ganti `handleSubmit`/`router.push` dengan `const [state, formAction, pending]
  = useActionState(login, null)`.
- `<form action={formAction}>`. Tampilkan `state.error` bila ada (blok merah).
- Tombol submit `disabled={pending}` + teks "Memproses…" saat pending.
- `name="email"` & `name="password"` sudah ada — dipakai formData.

**`components/layout/AdminHeader.tsx` (UBAH)** — tombol Keluar jadi form action:
- Ganti `<Link href="/admin/login">` dengan `<form action={logout}>` berisi
  `<button type="submit">` bergaya sama (ikon LogOut + teks "Keluar").

**`app/admin/page.tsx` (UBAH — defense-in-depth)** — lapis kedua:
- Di awal komponen: `const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");`
- Middleware sudah melindungi, tapi server component memverifikasi ulang agar
  aman bila middleware terlewat.

### Alur

- **Login:** form → `login` action → `signInWithPassword` → set cookie →
  redirect `/admin`. Salah → form + pesan generik.
- **Proteksi:** middleware tiap `/admin/*` → `getUser()` → redirect sesuai aturan.
- **Logout:** tombol → `logout` action → `signOut` → redirect `/admin/login`.

## Penanganan error (login)

| Kondisi | Perilaku |
|---|---|
| Kredensial salah | `{ error: "Email atau kata sandi salah." }` (generik) |
| Email/password kosong | `{ error: "Email dan kata sandi wajib diisi." }` |
| Supabase tak terjangkau | `{ error: "Gagal terhubung. Coba lagi." }` + `console.error` |
| Sukses | redirect `/admin` (tanpa state error) |

## Edge case

- Sudah login buka `/admin/login` → redirect `/admin`.
- Sesi kedaluwarsa → request berikutnya `getUser()` gagal → redirect login;
  refresh token via middleware memperkecil peluang.
- Deep link `/admin/xxx` belum login → redirect `/admin/login` (pasca-login
  selalu ke `/admin`, TANPA redirect-balik — lihat non-goal).
- Env hilang → middleware gagal aman ke `/admin/login`.
- Logout saat sesi mati → tetap redirect `/admin/login` (idempoten).

## Non-goal (sub-proyek ini)

- Redirect-balik ke tujuan asal pasca-login (selalu `/admin`).
- "Ingat saya" fungsional — checkbox dibiarkan kosmetik (Supabase persist sesi
  by default).
- Reset/lupa password.
- Simpan nomor WhatsApp (§5.B.3) → sub-proyek #3.
- CRUD produk, upload gambar → sub-proyek #3.
- Multi-role / level admin.

## Setup (dipandu saat implementasi)

Pengguna membuat user admin: dashboard Supabase → Authentication → Users →
"Add user" → isi email + password → centang "Auto Confirm User" (agar bisa
langsung login tanpa verifikasi email).

## Verifikasi

- `tsc --noEmit` + `eslint` bersih.
- Belum login buka `/admin` → dialihkan ke `/admin/login` (cek via Playwright:
  goto `/admin`, URL akhir = `/admin/login`).
- Login kredensial salah → tetap di login + pesan error.
- Login kredensial benar (user dibuat di dashboard) → masuk `/admin`, tabel
  produk tampil.
- Sudah login buka `/admin/login` → dialihkan ke `/admin`.
- Klik "Keluar" → sesi berakhir, dialihkan `/admin/login`; buka `/admin` lagi →
  tetap dialihkan ke login (sesi benar-benar mati).
- Route publik (katalog `/`, detail `/produk/*`) tak terpengaruh middleware.

## Risiko & mitigasi

- **Middleware salah matcher membebani route publik** → matcher ketat
  `/admin/:path*`; verifikasi katalog tetap jalan.
- **`getSession` vs `getUser`** → wajib `getUser` (validasi server) di middleware
  & page; jangan andalkan cookie mentah.
- **Cookie tak tersimpan saat refresh** → ikuti pola `setAll` `@supabase/ssr`
  persis (tulis ke request & response).
