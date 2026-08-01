import type { Product, ProductSpecs, StockStatus } from "./types";
import { createClient } from "./supabase/server";

/** Baris mentah dari tabel `products` (snake_case, specs/images JSONB). */
type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  material: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  specs: ProductSpecs;
  created_at: string;
};

function rowToProduct(row: ProductRow): Product {
  const status: StockStatus = row.stock > 0 ? "ready" : "preorder";
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    material: row.material,
    price: row.price,
    stock: row.stock,
    status,
    description: row.description,
    images: row.images,
    createdAt: row.created_at,
    specs: row.specs,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllProducts] gagal memuat produk:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`[getProductBySlug] gagal memuat '${slug}':`, error.message);
    return null;
  }
  return data ? rowToProduct(data as ProductRow) : null;
}
