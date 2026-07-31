import type { Product, SortOption } from "./types";
import { WEIGHT_RANGES } from "./constants";

export type Filters = {
  query: string;
  brands: string[];
  materials: string[];
  /** Indeks ke WEIGHT_RANGES */
  weightRanges: number[];
  priceMin: number | null;
  priceMax: number | null;
  sort: SortOption;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  brands: [],
  materials: [],
  weightRanges: [],
  priceMin: null,
  priceMax: null,
  sort: "recommended",
};

export function applyFilters(products: Product[], f: Filters): Product[] {
  const q = f.query.trim().toLowerCase();

  const result = products.filter((p) => {
    if (q && !`${p.name} ${p.brand} ${p.material}`.toLowerCase().includes(q)) {
      return false;
    }
    if (f.brands.length > 0 && !f.brands.includes(p.brand)) return false;
    if (f.materials.length > 0 && !f.materials.includes(p.material)) {
      return false;
    }
    if (f.weightRanges.length > 0) {
      const cocok = f.weightRanges.some((i) => {
        const r = WEIGHT_RANGES[i];
        return p.specs.weightAvg >= r.min && p.specs.weightAvg < r.max;
      });
      if (!cocok) return false;
    }
    if (f.priceMin !== null && p.price < f.priceMin) return false;
    if (f.priceMax !== null && p.price > f.priceMax) return false;
    return true;
  });

  // Salin sebelum sort — Array.sort mengubah array di tempat, dan
  // `products` adalah array modul yang dipakai bersama.
  switch (f.sort) {
    case "price-asc":
      return [...result].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...result].sort((a, b) => b.price - a.price);
    case "newest":
      return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return result;
  }
}
