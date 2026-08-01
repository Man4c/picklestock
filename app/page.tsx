import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getAllProducts } from "@/lib/products";

export default async function Home() {
  const products = await getAllProducts();

  return (
    <>
      <TopNav />
      <div className="pt-16">
        <CatalogView products={products} />
      </div>
      <Footer />
    </>
  );
}
