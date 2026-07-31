import type { Metadata } from "next";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { ProductTable } from "@/components/admin/ProductTable";
import { getAllProducts } from "@/lib/products";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Dashboard Admin — ${SITE_NAME}`,
};

export default function AdminPage() {
  const products = getAllProducts();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AdminHeader />
      <main className="mx-auto mt-16 flex w-full max-w-[1200px] flex-1 flex-col gap-stack-section px-margin-page py-stack-section">
        <ProductTable products={products} />
      </main>
      <Footer />
    </div>
  );
}
