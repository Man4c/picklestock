import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getProductsPage } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/settings";
import { CATALOG_PAGE_SIZE } from "@/lib/constants";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const [productPage, whatsappNumber] = await Promise.all([
    getProductsPage({
      page: requestedPage,
      pageSize: CATALOG_PAGE_SIZE,
      query: params.q ?? "",
    }),
    getWhatsAppNumber(),
  ]);

  return (
    <>
      <TopNav />
      <div className="pt-16">
        <CatalogView productPage={productPage} whatsappNumber={whatsappNumber} />
      </div>
      <Footer />
    </>
  );
}
