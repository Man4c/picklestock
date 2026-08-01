# Auth Admin Supabase — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Login/logout admin nyata via Supabase Auth + proteksi route `/admin/*`.

**Architecture:** `proxy.ts` (Next 16, dulu middleware) mencegat `/admin/*`, memvalidasi sesi via `getUser()`, dan mengalihkan sesuai status login. Login/logout sebagai Server Actions. Defense-in-depth: `/admin` juga cek user.

**Tech Stack:** Next.js 16 (Proxy, Server Actions, `useActionState`), Supabase Auth (`@supabase/ssr`), TypeScript.

## Global Constraints

- **Next 16: `middleware.ts` DEPRECATED → pakai `proxy.ts` dengan fungsi `proxy`.** Verifikasi di `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
- Wajib `supabase.auth.getUser()` (validasi ke server), BUKAN `getSession()` (baca cookie mentah, bisa dipalsukan).
- Tak ada test runner — verifikasi via `npx tsc --noEmit`, `npx eslint <file>`, Playwright.
- Akun admin dibuat manual di dashboard Supabase (tak ada signup di app).
- Pesan error login generik (jangan bocorkan email vs password mana yang salah).
- Data/kredensial hanya di server (Server Action / proxy) — tak ada di klien.
- `/admin/login` route nested di bawah `/admin` — cek path ini DULU di proxy untuk hindari redirect loop.

---

## Task 1: Client Supabase untuk Proxy

**Files:**
- Create: `lib/supabase/proxy.ts`

**Interfaces:**
- Consumes: env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Produces: `updateSession(request: NextRequest): Promise<NextResponse>`.

- [ ] **Step 1: Tulis `lib/supabase/proxy.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Menyegarkan sesi Supabase & menegakkan proteksi route untuk Proxy Next 16.
 * Memakai getUser() (validasi ke server Supabase), bukan getSession().
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;

  // Env hilang → gagal aman: alihkan semua /admin/* (kecuali login) ke login.
  if (!url || !key) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cek /admin/login DULU — route ini nested di bawah /admin; tanpa
  // pengecekan ini, "belum login buka /admin/login" jadi redirect loop.
  if (pathname === "/admin/login") {
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}
```

- [ ] **Step 2: Type-check & lint**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint lib/supabase/proxy.ts` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/proxy.ts
git commit -m "feat: helper updateSession untuk proxy auth Supabase"
```

---

## Task 2: File proxy.ts (entry)

**Files:**
- Create: `proxy.ts` (root proyek)

**Interfaces:**
- Consumes: `updateSession` dari `lib/supabase/proxy.ts`.

- [ ] **Step 1: Tulis `proxy.ts`**

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

- [ ] **Step 2: Type-check & lint**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint proxy.ts` → exit 0.

- [ ] **Step 3: Verifikasi proteksi (belum ada login berfungsi, tapi redirect harus jalan)**

Restart dev server (agar proxy termuat). Playwright: goto `/admin` → URL akhir harus `/admin/login` (belum ada sesi). Ini membuktikan proxy aktif sebelum action dibuat.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git commit -m "feat: proxy.ts proteksi route /admin/*"
```

---

## Task 3: Server Actions login & logout

**Files:**
- Create: `app/admin/actions.ts`

**Interfaces:**
- Consumes: `createClient` dari `lib/supabase/server.ts`.
- Produces: `login(prevState, formData): Promise<{ error: string }>`, `logout(): Promise<void>`.

- [ ] **Step 1: Tulis `app/admin/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] gagal:", error.message);
    // Pesan generik — jangan bedakan email vs password salah.
    if (error.message.toLowerCase().includes("invalid")) {
      return { error: "Email atau kata sandi salah." };
    }
    return { error: "Gagal terhubung. Coba lagi." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```
Catatan: `redirect()` melempar internal (NEXT_REDIRECT) — itu wajar, jangan bungkus dalam try/catch yang menelannya.

- [ ] **Step 2: Type-check & lint**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint app/admin/actions.ts` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/admin/actions.ts
git commit -m "feat: server action login & logout admin"
```

---

## Task 4: LoginForm pakai action

**Files:**
- Modify: `components/admin/LoginForm.tsx`

**Interfaces:**
- Consumes: `login` dari `app/admin/actions.ts`.

- [ ] **Step 1: Ubah `LoginForm.tsx`**

Ganti impor & logika:
- Hapus `useRouter`, `handleSubmit`, `type FormEvent`.
- Tambah `import { useActionState } from "react";` dan `import { login } from "@/app/admin/actions";`.
- Di komponen: `const [state, formAction, pending] = useActionState(login, null);`
- `<form action={formAction} ...>` (ganti `onSubmit={handleSubmit}`).
- Sebelum field, tampilkan error bila ada:
```tsx
{state?.error && (
  <p
    role="alert"
    className="rounded-btn bg-error-container px-4 py-2.5 font-body-sm text-body-sm text-on-error-container"
  >
    {state.error}
  </p>
)}
```
- Tombol submit: `disabled={pending}` dan teks `{pending ? "Memproses…" : "Masuk ke Dashboard"}` (pertahankan ikon ArrowRight saat tak pending).

- [ ] **Step 2: Type-check & lint**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint components/admin/LoginForm.tsx` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/admin/LoginForm.tsx
git commit -m "feat: LoginForm memanggil server action login + tampil error"
```

---

## Task 5: Tombol logout di AdminHeader

**Files:**
- Modify: `components/layout/AdminHeader.tsx`

**Interfaces:**
- Consumes: `logout` dari `app/admin/actions.ts`.

- [ ] **Step 1: Ubah tombol Keluar jadi form action**

Ganti `<Link href="/admin/login" ...>` dengan:
```tsx
<form action={logout}>
  <button
    type="submit"
    aria-label="Keluar"
    className="inline-flex items-center gap-2 rounded-btn border border-border-subtle px-3 py-2 font-label-md text-label-md text-secondary transition-colors hover:text-primary"
  >
    <LogOut size={18} aria-hidden="true" />
    <span className="hidden sm:inline">Keluar</span>
  </button>
</form>
```
Tambah `import { logout } from "@/app/admin/actions";`. Hapus impor `Link` bila tak lagi dipakai (cek: masih dipakai untuk apa pun? bila tidak, hapus).

- [ ] **Step 2: Type-check & lint**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint components/layout/AdminHeader.tsx` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/layout/AdminHeader.tsx
git commit -m "feat: tombol Keluar admin memanggil server action logout"
```

---

## Task 6: Defense-in-depth di halaman admin

**Files:**
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `createClient` dari `lib/supabase/server.ts`.

- [ ] **Step 1: Tambah cek user di awal AdminPage**

Di awal `export default async function AdminPage()`, sebelum `getAllProducts`:
```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
// ...
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) redirect("/admin/login");
```

- [ ] **Step 2: Type-check & lint**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint app/admin/page.tsx` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: defense-in-depth cek user di halaman admin"
```

---

## Task 7: Setup akun admin & verifikasi e2e

**Files:** tak ada perubahan kode.

- [ ] **Step 1: Pengguna membuat user admin (dipandu)**

Pandu: dashboard Supabase → Authentication → Users → "Add user" → "Create new user" → isi email + password → **centang "Auto Confirm User"** (agar bisa langsung login tanpa verifikasi email) → Create.

- [ ] **Step 2: Restart dev server**

Matikan server lama, `npm run dev`, catat port.

- [ ] **Step 3: Verifikasi proteksi (belum login)**

Playwright: goto `/admin` → URL akhir = `/admin/login`. goto `/admin/produk/xyz` → `/admin/login`.

- [ ] **Step 4: Verifikasi login gagal**

Playwright: isi email/password ngawur, submit → tetap di `/admin/login`, muncul teks "Email atau kata sandi salah."

- [ ] **Step 5: Verifikasi login sukses**

Playwright: isi kredensial admin yang dibuat di Step 1, submit → URL jadi `/admin`, tabel produk tampil. Screenshot.

- [ ] **Step 6: Verifikasi sudah login buka /admin/login**

Playwright (sesi login masih aktif): goto `/admin/login` → dialihkan ke `/admin`.

- [ ] **Step 7: Verifikasi logout**

Playwright: klik tombol "Keluar" → URL jadi `/admin/login`. Lalu goto `/admin` → tetap dialihkan ke `/admin/login` (sesi benar-benar mati).

- [ ] **Step 8: Verifikasi route publik tak terpengaruh**

Playwright: goto `/` → katalog tampil (6 produk). goto `/produk/pro-pickleball-paddle-carbon-x` → detail tampil. (Proxy tak boleh mengganggu route publik.)

- [ ] **Step 9: Type-check & lint final**

Run: `npx tsc --noEmit` → exit 0. `npx eslint .` → exit 0.

- [ ] **Step 10: Update AGENTS.md**

Catat auth admin kini aktif: proxy.ts proteksi /admin/*, login/logout via server action, akun dibuat manual di dashboard.

```bash
git add AGENTS.md
git commit -m "docs: catat auth admin aktif di AGENTS.md"
```

---

## Self-Review (diisi penulis rencana)

**Spec coverage:**
- Client proxy `updateSession` + getUser → Task 1 ✓
- proxy.ts matcher /admin/* → Task 2 ✓
- Server actions login/logout → Task 3 ✓
- LoginForm useActionState + error → Task 4 ✓
- AdminHeader logout action → Task 5 ✓
- Defense-in-depth page → Task 6 ✓
- Setup akun + verifikasi (proteksi, gagal, sukses, sudah-login, logout, publik) → Task 7 ✓
- Redirect-loop guard (/admin/login dicek dulu) → Task 1 Step 1 ✓
- Env hilang gagal aman → Task 1 Step 1 ✓
- Non-goal (redirect-balik, ingat saya, reset password, WA, CRUD) → tak ada task, benar ✓

**Placeholder scan:** tak ada TODO/TBD; semua step berisi kode/perintah nyata.

**Type consistency:** `updateSession(NextRequest): Promise<NextResponse>` (Task 1) dipakai Task 2 ✓. `login(prevState, formData): Promise<{error:string}>` (Task 3) dikonsumsi `useActionState` Task 4 ✓. `logout(): Promise<void>` (Task 3) dipakai `<form action>` Task 4/5 ✓. `createClient` dari lib/supabase/server.ts (sub-proyek #1) dipakai Task 3 & 6 ✓.
