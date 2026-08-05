/** Fallback aman ketika pengaturan Supabase belum tersedia. */
export const WHATSAPP_NUMBER = "+62 812-3456-7890";

export const BRANDS = ["JOOLA", "Selkirk", "CRBN", "Head"] as const;

export const MATERIALS = ["Carbon Fiber", "Fiberglass", "Composite"] as const;

/** Rentang berat (oz) untuk filter — PRD §5.A.2 */
export const WEIGHT_RANGES = [
  { label: "Ringan (< 7.8 oz)", min: 0, max: 7.8 },
  { label: "Sedang (7.8 – 8.2 oz)", min: 7.8, max: 8.2 },
  { label: "Berat (> 8.2 oz)", min: 8.2, max: Infinity },
] as const;

import type { SortOption } from "./types";

/** Pilihan urutan — dipakai bersama sidebar desktop & sheet Urutkan mobile. */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Rekomendasi" },
  { value: "price-asc", label: "Harga: Termurah" },
  { value: "price-desc", label: "Harga: Termahal" },
  { value: "newest", label: "Terbaru" },
];

export const FOOTER_YEAR = 2026;

export const SITE_NAME = "PickleStock";
