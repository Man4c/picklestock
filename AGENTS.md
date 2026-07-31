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

Data produk berasal dari `lib/products.ts`. Saat Supabase masuk, file itulah
satu-satunya yang perlu diganti — komponen tampilan tidak menyentuh sumber data.

Ikon memakai `lucide-react` (SVG inline). Jangan memuat font Material Symbols
dari CDN.
