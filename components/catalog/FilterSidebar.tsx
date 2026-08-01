"use client";

import { BRANDS, MATERIALS, WEIGHT_RANGES } from "@/lib/constants";
import type { Filters } from "@/lib/filter";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 font-headline-sm text-headline-sm">Urutkan</h3>
        <select
          aria-label="Urutkan produk"
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as Filters["sort"] })
          }
          className="w-full cursor-pointer appearance-none rounded-input border-none bg-surface-input px-4 py-3 font-body-sm text-body-sm focus:ring-1 focus:ring-primary"
        >
          <option value="recommended">Rekomendasi</option>
          <option value="price-asc">Harga: Termurah</option>
          <option value="price-desc">Harga: Termahal</option>
          <option value="newest">Terbaru</option>
        </select>
      </div>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">Merek</legend>
        <div className="flex flex-col gap-3">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() =>
                  onChange({ ...filters, brands: toggle(filters.brands, brand) })
                }
                className="h-5 w-5 rounded border-border-subtle focus:ring-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">Bahan</legend>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((material) => {
            const active = filters.materials.includes(material);
            return (
              <button
                key={material}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({
                    ...filters,
                    materials: toggle(filters.materials, material),
                  })
                }
                className={`rounded-full px-3 py-1.5 font-body-sm text-body-sm transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "border border-border-subtle text-on-surface hover:border-primary"
                }`}
              >
                {material}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">Berat</legend>
        <div className="flex flex-col gap-3">
          {WEIGHT_RANGES.map((range, i) => (
            <label
              key={range.label}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="checkbox"
                checked={filters.weightRanges.includes(i)}
                onChange={() =>
                  onChange({
                    ...filters,
                    weightRanges: toggle(filters.weightRanges, i),
                  })
                }
                className="h-5 w-5 rounded border-border-subtle focus:ring-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-6">
        <legend className="mb-4 font-headline-sm text-headline-sm">
          Rentang Harga
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Harga minimum"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-btn border-none bg-surface-input px-3 py-2 text-center font-body-sm text-body-sm"
          />
          <span className="text-secondary">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Harga maksimum"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-btn border-none bg-surface-input px-3 py-2 text-center font-body-sm text-body-sm"
          />
        </div>
      </fieldset>
    </div>
  );
}
