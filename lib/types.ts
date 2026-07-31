export type StockStatus = "ready" | "preorder";

export type SortOption =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "newest";

export type ProductSpecs = {
  /** Teks tampilan apa adanya, mis. "7.8 - 8.2 oz" */
  weight: string;
  /** Angka (oz) untuk penyaringan — teks tidak bisa dibandingkan */
  weightAvg: number;
  thickness: string;
  surface: string;
  core: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  material: string;
  /** Rupiah sebagai integer; diformat saat render */
  price: number;
  stock: number;
  status: StockStatus;
  description: string;
  images: string[];
  /** ISO date, untuk urutan "Terbaru" */
  createdAt: string;
  specs: ProductSpecs;
};
