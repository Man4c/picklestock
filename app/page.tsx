import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getAllProducts } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/settings";

export default async function Home() {
  const [products, whatsappNumber] = await Promise.all([
    getAllProducts(),
    getWhatsAppNumber(),
  ]);

  return (
    <>
      <TopNav />
      <div className="pt-16">
        <CatalogView products={products} whatsappNumber={whatsappNumber} />
      </div>
      <Footer />
    </>
  );
}
