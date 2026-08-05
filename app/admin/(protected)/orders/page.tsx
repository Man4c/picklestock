import type { Metadata } from "next";
import { OrderManager } from "@/components/admin/OrderManager";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import {
  getOrderProductOptions,
  getOrdersPage,
  parseOrderStatus,
} from "@/lib/orders";

export const metadata: Metadata = {
  title: "Pesanan & Penjualan",
  robots: { index: false, follow: false },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const status = parseOrderStatus(params.status);
  const [orderPage, products] = await Promise.all([
    getOrdersPage({
      page: Number(params.page ?? "1"),
      pageSize: ADMIN_PAGE_SIZE,
      query: params.q ?? "",
      status,
    }),
    getOrderProductOptions(),
  ]);

  return <OrderManager orderPage={orderPage} products={products} />;
}
