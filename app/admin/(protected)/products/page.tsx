import type { Metadata } from "next";
import { ProductTable } from "@/components/admin/ProductTable";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { getProductsPage } from "@/lib/products";

export const metadata: Metadata = {
  title: "Manajemen Produk",
  robots: { index: false, follow: false },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const productPage = await getProductsPage({
    page: Number(params.page ?? "1"),
    pageSize: ADMIN_PAGE_SIZE,
    query: params.q ?? "",
  });

  return <ProductTable productPage={productPage} />;
}
