import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatRupiah, buildWhatsAppUrl } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function ProductCard({ product }: { product: Product }) {
  const ready = product.status === "ready";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-surface-level1 transition-shadow hover:shadow-soft">
      <div className="absolute left-3 top-3 z-10">
        <Badge status={product.status}>
          {ready ? "Tersedia" : "Pre-Order"}
        </Badge>
      </div>

      <Link
        href={`/produk/${product.slug}`}
        className="flex aspect-[4/5] items-center justify-center overflow-hidden border-b border-border-subtle/50 bg-surface-pure p-4"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={500}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-padding-card">
        <span className="mb-1 font-body-sm text-body-sm text-secondary">
          {product.brand} • {product.material}
        </span>
        <h2 className="mb-3 line-clamp-2 font-headline-sm text-headline-sm leading-tight text-on-surface">
          <Link href={`/produk/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>

        <div className="mt-auto">
          <p className="mb-4 font-price-tag text-price-tag text-on-surface">
            {formatRupiah(product.price)}
          </p>
          <a
            href={buildWhatsAppUrl(WHATSAPP_NUMBER, product)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-btn py-2.5 font-label-md text-label-md transition-colors ${
              ready
                ? "bg-primary text-on-primary hover:bg-inverse-surface"
                : "border border-border-subtle bg-transparent text-on-surface hover:border-primary"
            }`}
          >
            <WhatsAppIcon size={18} />
            {ready ? "Pesan via WhatsApp" : "Pre-Order via WhatsApp"}
          </a>
        </div>
      </div>
    </article>
  );
}
