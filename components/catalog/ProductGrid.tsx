import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border-subtle bg-surface-container-low py-16 text-center">
        <p className="font-headline-md text-headline-md text-on-surface">
          Tidak ada raket yang cocok
        </p>
        <p className="mt-2 font-body-md text-body-md text-secondary">
          Coba ubah atau hapus sebagian filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-gutter-grid md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
