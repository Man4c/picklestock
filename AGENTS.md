<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design system

Token berada di `app/globals.css` dalam blok `@theme` (Tailwind v4) —
diterjemahkan dari `D:\Projects\PickleStock\Stitch AI\picklestock\DESIGN.md`.
Ubah warna dan tipografi di sana, jangan menulis nilai hex langsung di komponen.

Mockup asli (`Stitch AI/*/code.html`) memakai Tailwind v3 via CDN dan **bukan
rujukan yang bisa disalin apa adanya**. Penyimpangan yang disengaja beserta
alasannya tercatat di
`docs/superpowers/specs/2026-07-31-integrasi-design-stitch-design.md`.

Data produk diakses lewat `lib/products.ts` (`getAllProducts`,
`getProductBySlug`) — komponen tampilan tidak menyentuh sumber data. Kini
membaca dari **Supabase** (bukan lagi array statis): client di
`lib/supabase/server.ts`, kredensial di `.env.local` (template `.env.example`),
skema & seed di `docs/supabase/`. `status` produk diturunkan dari `stock`
(> 0 = `ready`), tidak disimpan di DB. Menulis (CRUD admin) belum ada — masih
sub-proyek berikutnya; lihat `docs/superpowers/specs/2026-08-01-supabase-*`.

Ikon memakai `lucide-react` (SVG inline). Jangan memuat font Material Symbols
dari CDN.

## Auth admin

Route `/admin/*` dijaga oleh **Proxy** Next 16 (`proxy.ts` di root →
`lib/supabase/proxy.ts`; `middleware.ts` sudah deprecated). Proxy memakai
`getUser()` (validasi ke server Supabase), **bukan** `getSession()` yang hanya
membaca cookie mentah dan bisa dipalsukan. `app/admin/page.tsx` mengecek ulang
`getUser()` sebagai pertahanan berlapis.

Login/logout lewat **Server Actions** di `app/admin/actions.ts`
(`signInWithPassword` / `signOut`). Pesan error sengaja generik ("Email atau
kata sandi salah.") — jangan bocorkan apakah email atau password yang salah.
Akun admin dibuat manual di dashboard Supabase (Authentication → Add user →
Auto Confirm); tidak ada alur registrasi self-service.
