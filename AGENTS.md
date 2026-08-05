<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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
(> 0 = `ready`), tidak disimpan di DB.

CRUD admin memakai Server Actions di `app/admin/product-actions.ts`; setiap
action memvalidasi sesi dan keanggotaan `admin_users` sebelum menulis serta memanggil `revalidatePath`
untuk katalog, admin, dan detail produk. Policy tulis tabel + bucket publik
`product-images` ada di `docs/supabase/crud-storage.sql` (juga tercakup dalam
`schema.sql`). RLS memanggil `public.is_admin()` sehingga hanya anggota
`public.admin_users` yang boleh insert/update/delete.
Gambar baru dibatasi JPG/PNG/WebP, maksimal 4 file dan 5 MB per file. Hapus
produk juga membersihkan objek Storage yang terkait.

Nomor WhatsApp katalog dibaca dari tabel publik `site_settings` melalui
`lib/settings.ts` dan hanya dapat diubah admin lewat Server Action
`updateWhatsAppNumber`. Migration-nya ada di
`docs/supabase/whatsapp-settings.sql`; konstanta di `lib/constants.ts` hanya
fallback ketika pengaturan belum tersedia.

Ikon memakai `lucide-react` (SVG inline). Jangan memuat font Material Symbols
dari CDN.

## Auth admin

Route `/admin/*` dijaga oleh **Proxy** Next 16 (`proxy.ts` di root →
`lib/supabase/proxy.ts`; `middleware.ts` sudah deprecated). Proxy memakai
`getUser()` (validasi ke server Supabase), **bukan** `getSession()` yang hanya
membaca cookie mentah dan bisa dipalsukan. Proxy dan `app/admin/page.tsx`
mengecek ulang keanggotaan `admin_users` sebagai pertahanan berlapis.

Login/logout lewat **Server Actions** di `app/admin/actions.ts`
(`signInWithPassword` / `signOut`). Pesan error sengaja generik ("Email atau
kata sandi salah.") — jangan bocorkan apakah email atau password yang salah.
Akun dibuat manual di dashboard Supabase (Authentication → Add user → Auto
Confirm), kemudian akses diberikan lewat `public.admin_users`; tidak ada alur
registrasi self-service.
