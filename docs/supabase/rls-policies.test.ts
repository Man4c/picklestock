// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "docs", "supabase", "schema.sql"),
  "utf8",
);

describe("regresi kebijakan RLS", () => {
  it("melarang anon menulis produk dan pengaturan", () => {
    expect(sql).toContain(
      "revoke insert, update, delete on table public.products from anon",
    );
    expect(sql).toContain(
      "revoke insert, update, delete on table public.site_settings from anon",
    );
  });

  it("membatasi policy tulis ke anggota admin_users", () => {
    expect(sql).toContain("create table if not exists public.admin_users");
    expect(sql).toContain("create or replace function public.is_admin()");
    expect(sql).toMatch(/for insert to authenticated/g);
    expect(sql).toMatch(/for update to authenticated/g);
    expect(sql).toMatch(/for delete to authenticated/g);
    expect(sql).toMatch(/select public\.is_admin\(\)/g);
    expect(sql).not.toContain("with check (true)");
  });

  it("membatasi Storage ke bucket product-images", () => {
    expect(sql).toContain(
      "with check (bucket_id = 'product-images' and (select public.is_admin()))",
    );
    expect(sql).toContain(
      "using (bucket_id = 'product-images' and (select public.is_admin()))",
    );
  });

  it("tidak mengizinkan client mengubah daftar admin", () => {
    expect(sql).toContain(
      "revoke insert, update, delete on table public.admin_users from authenticated",
    );
    expect(sql).toContain("using (user_id = (select auth.uid()))");
  });
});
