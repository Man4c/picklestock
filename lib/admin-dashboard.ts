import { createClient } from "@/lib/supabase/server";

export const LOW_STOCK_THRESHOLD = 3;

export type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  stock: number;
};

export type BestSeller = {
  key: string;
  name: string;
  unitsSold: number;
};

export type AdminDashboardSummary = {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
  bestSellers: BestSeller[];
};

const EMPTY_SUMMARY: AdminDashboardSummary = {
  totalProducts: 0,
  totalStock: 0,
  inventoryValue: 0,
  lowStockCount: 0,
  lowStockProducts: [],
  bestSellers: [],
};

function safeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Menormalisasi JSON dari fungsi PostgreSQL agar kegagalan atau data lama
 * tidak pernah membuat dashboard admin gagal dirender.
 */
export function parseAdminDashboardSummary(
  value: unknown,
): AdminDashboardSummary {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY_SUMMARY;
  }

  const row = value as Record<string, unknown>;
  const lowStockProducts = Array.isArray(row.low_stock_products)
    ? row.low_stock_products.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return [];
        const product = item as Record<string, unknown>;
        if (
          typeof product.id !== "string" ||
          typeof product.name !== "string" ||
          typeof product.sku !== "string"
        ) {
          return [];
        }
        return [{
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: safeNumber(product.stock),
        }];
      })
    : [];

  const bestSellers = Array.isArray(row.best_sellers)
    ? row.best_sellers.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return [];
        const seller = item as Record<string, unknown>;
        if (typeof seller.key !== "string" || typeof seller.name !== "string") {
          return [];
        }
        return [{
          key: seller.key,
          name: seller.name,
          unitsSold: safeNumber(seller.units_sold),
        }];
      })
    : [];

  return {
    totalProducts: safeNumber(row.total_products),
    totalStock: safeNumber(row.total_stock),
    inventoryValue: safeNumber(row.inventory_value),
    lowStockCount: safeNumber(row.low_stock_count),
    lowStockProducts,
    bestSellers,
  };
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_summary", {
    low_stock_threshold: LOW_STOCK_THRESHOLD,
  });

  if (error) {
    console.error("[getAdminDashboardSummary] gagal:", error.message);
    return EMPTY_SUMMARY;
  }

  return parseAdminDashboardSummary(data);
}
