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

  it("membatasi policy tulis ke role authenticated", () => {
    expect(sql).toMatch(/for insert to authenticated/g);
    expect(sql).toMatch(/for update to authenticated/g);
    expect(sql).toMatch(/for delete to authenticated/g);
  });

  it("membatasi Storage ke bucket product-images", () => {
    expect(sql).toContain("with check (bucket_id = 'product-images')");
    expect(sql).toContain("using (bucket_id = 'product-images')");
  });
});
