import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { ProductTable } from "@/components/admin/ProductTable";
import { getAllProducts } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/settings";
import { getAdminClient } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Pertahanan berlapis: Proxy sudah menjaga /admin/*, tapi jangan pernah
  // merender dashboard tanpa memverifikasi user ke server Supabase.
  const admin = await getAdminClient();
  if (!admin) {
    redirect("/admin/login");
  }

  const [products, whatsappNumber] = await Promise.all([
    getAllProducts(),
    getWhatsAppNumber(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AdminHeader whatsappNumber={whatsappNumber} />
      <main className="mx-auto mt-16 flex w-full max-w-[1200px] flex-1 flex-col gap-stack-section px-margin-page py-stack-section">
        <ProductTable products={products} whatsappNumber={whatsappNumber} />
      </main>
      <Footer />
    </div>
  );
}
