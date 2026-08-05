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

export type ProductPage = {
  products: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  query: string;
};

function normalizeSearchQuery(value: string): string {
  return value.trim().slice(0, 80).replace(/[%_,()]/g, " ").replace(/\s+/g, " ");
}

export async function getProductsPage({
  page = 1,
  pageSize,
  query = "",
}: {
  page?: number;
  pageSize: number;
  query?: string;
}): Promise<ProductPage> {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const search = normalizeSearchQuery(query);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize - 1;
  const supabase = await createClient();

  let request = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end);

  if (search) {
    const pattern = `%${search}%`;
    request = request.or(
      `name.ilike.${pattern},brand.ilike.${pattern},sku.ilike.${pattern},material.ilike.${pattern}`,
    );
  }

  const { data, error, count } = await request;
  if (error) {
    console.error("[getProductsPage] gagal memuat produk:", error.message);
    return {
      products: [],
      page: safePage,
      pageSize: safePageSize,
      total: 0,
      totalPages: 0,
      query: search,
    };
  }

  const total = count ?? 0;
  return {
    products: (data ?? []).map((row) => rowToProduct(row as ProductRow)),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / safePageSize),
    query: search,
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
  // `data` bisa null pada sebagian kondisi meski tanpa error — guard agar
  // katalog tampil kosong, bukan crash (sesuai intent penanganan error spec).
  return (data ?? []).map(rowToProduct);
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
