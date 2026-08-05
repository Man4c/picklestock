// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseAdminDashboardSummary } from "./admin-dashboard";

describe("parseAdminDashboardSummary", () => {
  it("memetakan ringkasan database ke bentuk yang dipakai UI", () => {
    expect(
      parseAdminDashboardSummary({
        total_products: 4,
        total_stock: 9,
        inventory_value: 25_800_000,
        low_stock_count: 2,
        low_stock_products: [
          { id: "p1", name: "Swift", sku: "SW-01", stock: 1 },
        ],
        best_sellers: [
          { key: "p1", name: "Swift", units_sold: 7 },
        ],
      }),
    ).toEqual({
      totalProducts: 4,
      totalStock: 9,
      inventoryValue: 25_800_000,
      lowStockCount: 2,
      lowStockProducts: [
        { id: "p1", name: "Swift", sku: "SW-01", stock: 1 },
      ],
      bestSellers: [{ key: "p1", name: "Swift", unitsSold: 7 }],
    });
  });

  it("menghasilkan ringkasan kosong untuk respons yang tidak valid", () => {
    expect(parseAdminDashboardSummary(null)).toEqual({
      totalProducts: 0,
      totalStock: 0,
      inventoryValue: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      bestSellers: [],
    });
  });
});
