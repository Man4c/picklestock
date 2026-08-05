// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "docs", "supabase", "schema.sql"),
  "utf8",
);

describe("regresi kebijakan RLS", () => {
  it("melarang anon menulis produk, pengaturan, dan pesanan", () => {
    expect(sql).toContain(
      "revoke insert, update, delete on table public.products from anon",
    );
    expect(sql).toContain(
      "revoke insert, update, delete on table public.site_settings from anon",
    );
    expect(sql).toContain("revoke all on table public.orders from anon");
  });

  it("menjaga seluruh operasi pesanan hanya untuk admin", () => {
    expect(sql).toContain("alter table public.orders enable row level security");
    expect(sql).toContain('create policy "Admins can read orders"');
    expect(sql).toContain('create policy "Admins can insert orders"');
    expect(sql).toContain('create policy "Admins can update orders"');
    expect(sql).toContain('create policy "Admins can delete orders"');
  });

  it("membatasi policy tulis ke anggota admin_users", () => {
    expect(sql).toContain("create table if not exists public.admin_users");
    expect(sql).toContain("create or replace function private.is_admin()");
    expect(sql).toMatch(/for insert to authenticated/g);
    expect(sql).toMatch(/for update to authenticated/g);
    expect(sql).toMatch(/for delete to authenticated/g);
    expect(sql).toMatch(/select private\.is_admin\(\)/g);
    expect(sql).not.toContain("with check (true)");
  });

  it("membatasi Storage ke bucket product-images", () => {
    expect(sql).toContain(
      "with check (bucket_id = 'product-images' and (select private.is_admin()))",
    );
    expect(sql).toContain(
      "using (bucket_id = 'product-images' and (select private.is_admin()))",
    );
    expect(sql).not.toContain('create policy "Authenticated admins can view product images"');
  });

  it("tidak mengizinkan client mengubah daftar admin", () => {
    expect(sql).toContain(
      "revoke insert, update, delete on table public.admin_users from authenticated",
    );
    expect(sql).toContain("using (user_id = (select auth.uid()))");
  });
});
