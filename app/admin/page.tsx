import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { ProductTable } from "@/components/admin/ProductTable";
import { getProductsPage } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/settings";
import { getAdminClient } from "@/lib/admin";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { getAdminDashboardSummary } from "@/lib/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  // Pertahanan berlapis: Proxy sudah menjaga /admin/*, tapi jangan pernah
  // merender dashboard tanpa memverifikasi user ke server Supabase.
  const admin = await getAdminClient();
  if (!admin) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const [productPage, whatsappNumber, dashboardSummary] = await Promise.all([
    getProductsPage({
      page: Number(params.page ?? "1"),
      pageSize: ADMIN_PAGE_SIZE,
      query: params.q ?? "",
    }),
    getWhatsAppNumber(),
    getAdminDashboardSummary(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AdminHeader whatsappNumber={whatsappNumber} />
      <main className="mx-auto mt-16 flex w-full max-w-[1200px] flex-1 flex-col gap-stack-section px-margin-page py-stack-section">
        <AdminSectionNav active="products" />
        <AdminOverview summary={dashboardSummary} />
        <ProductTable productPage={productPage} whatsappNumber={whatsappNumber} />
      </main>
      <Footer />
    </div>
  );
}
