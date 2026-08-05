"use client";

import { useMemo, useState } from "react";
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { ProductPage } from "@/lib/products";
import { applyFilters, EMPTY_FILTERS, type Filters } from "@/lib/filter";
import { BRANDS, MATERIALS } from "@/lib/constants";
import { FilterSidebar } from "./FilterSidebar";
import { FilterSheet } from "./FilterSheet";
import { SortSheet } from "./SortSheet";
import { ProductGrid } from "./ProductGrid";
import { ServerSearch } from "@/components/ui/ServerSearch";
import { Pagination } from "@/components/ui/Pagination";

/** Jumlah kriteria filter aktif — untuk badge tombol "Filter" di mobile/tablet. */
function countActiveFilters(f: Filters): number {
  return (
    f.brands.length +
    f.materials.length +
    f.weightRanges.length +
    (f.priceMin !== null ? 1 : 0) +
    (f.priceMax !== null ? 1 : 0)
  );
}

export function CatalogView({
  productPage,
  whatsappNumber,
}: {
  productPage: ProductPage;
  whatsappNumber: string;
}) {
  const { products, page, total, totalPages, query } = productPage;
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [openSheet, setOpenSheet] = useState<null | "filter" | "sort">(null);

  const visible = useMemo(
    () => applyFilters(products, filters),
    [products, filters],
  );

  const activeCount = countActiveFilters(filters);

  const chips = [
    ...filters.brands.map((b) => ({ label: b, kind: "brand" as const })),
    ...filters.materials.map((m) => ({ label: m, kind: "material" as const })),
  ];

  function removeChip(chip: (typeof chips)[number]) {
    setFilters((f) =>
      chip.kind === "brand"
        ? { ...f, brands: f.brands.filter((b) => b !== chip.label) }
        : { ...f, materials: f.materials.filter((m) => m !== chip.label) },
    );
  }

  function toggleQuick(label: string) {
    const isBrand = (BRANDS as readonly string[]).includes(label);
    setFilters((f) => {
      const key = isBrand ? "brands" : "materials";
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(label)
          ? list.filter((v) => v !== label)
          : [...list, label],
      };
    });
  }

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-margin-page py-stack-section lg:flex-row">
      <aside className="flex w-full flex-shrink-0 flex-col gap-6 lg:w-64">
        {/* Pencarian + chip cepat — mobile & tablet (di bawah lg) */}
        <div className="lg:hidden">
          <ServerSearch
            initialQuery={query}
            placeholder="Cari raket, merek..."
            className="mb-4"
          />
          <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-2">
            {[...BRANDS, ...MATERIALS].map((label) => {
              const active =
                filters.brands.includes(label) ||
                filters.materials.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleQuick(label)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "border border-border-subtle bg-surface-pure text-on-surface"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Filter (Berat & Harga) dan Urutkan hanya dapat diakses lewat sheet
              ini pada layar di bawah lg. Dua tombol, dua sheet berbeda. */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpenSheet("filter")}
              aria-haspopup="dialog"
              aria-expanded={openSheet === "filter"}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn border border-border-subtle bg-surface-pure py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filter
              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-label-md text-body-sm text-on-primary">
                  {activeCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpenSheet("sort")}
              aria-haspopup="dialog"
              aria-expanded={openSheet === "sort"}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn border border-border-subtle bg-surface-pure py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary"
            >
              <ArrowUpDown size={16} aria-hidden="true" />
              Urutkan
            </button>
          </div>
        </div>

        {/* Sidebar filter — hanya desktop (lg ke atas) */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col gap-6">
        {/* Judul + pencarian + chip aktif — hanya desktop (lg ke atas) */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-1 font-headline-lg text-headline-lg">
                Katalog Raket
              </h1>
              <p className="font-body-sm text-body-sm text-secondary">
                Menampilkan {visible.length} dari {total} raket.
              </p>
            </div>
            <ServerSearch
              initialQuery={query}
              placeholder="Cari raket..."
              className="w-64"
            />
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={`${chip.kind}-${chip.label}`}
                  className="flex items-center gap-1 rounded-full bg-surface-input px-3 py-1 font-body-sm text-body-sm text-on-surface"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeChip(chip)}
                    aria-label={`Hapus filter ${chip.label}`}
                    className="transition-colors hover:text-error"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="ml-2 font-label-md text-body-sm text-primary hover:underline"
              >
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {/* Jumlah hasil — mobile & tablet (di bawah lg) */}
        <p className="font-body-sm text-body-sm text-secondary lg:hidden">
          Menampilkan {visible.length} hasil
        </p>

        <ProductGrid products={visible} whatsappNumber={whatsappNumber} />
        <Pagination
          page={page}
          totalPages={totalPages}
          pathname="/"
          query={{ q: query || undefined }}
        />
      </div>

      {openSheet === "filter" && (
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          resultCount={visible.length}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {openSheet === "sort" && (
        <SortSheet
          value={filters.sort}
          onSelect={(sort) => setFilters({ ...filters, sort })}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </main>
  );
}
