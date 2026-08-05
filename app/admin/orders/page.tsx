import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";
import { OrderManager } from "@/components/admin/OrderManager";
import { getAdminClient } from "@/lib/admin";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { getOrderProductOptions, getOrdersPage, parseOrderStatus } from "@/lib/orders";
import { getWhatsAppNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Pesanan & Penjualan",
  robots: { index: false, follow: false },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const admin = await getAdminClient();
  if (!admin) redirect("/admin/login");
  const params = await searchParams;
  const status = parseOrderStatus(params.status);
  const [orderPage, products, whatsappNumber] = await Promise.all([
    getOrdersPage({
      page: Number(params.page ?? "1"),
      pageSize: ADMIN_PAGE_SIZE,
      query: params.q ?? "",
      status,
    }),
    getOrderProductOptions(),
    getWhatsAppNumber(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AdminHeader whatsappNumber={whatsappNumber} />
      <main className="mx-auto mt-16 flex w-full max-w-[1200px] flex-1 flex-col gap-stack-section px-margin-page py-stack-section">
        <AdminSectionNav active="orders" />
        <OrderManager orderPage={orderPage} products={products} />
      </main>
      <Footer />
    </div>
  );
}
