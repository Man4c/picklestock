import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatRupiah, buildWhatsAppUrl } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function ProductCard({
  product,
  whatsappNumber,
  eager = false,
}: {
  product: Product;
  whatsappNumber: string;
  eager?: boolean;
}) {
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
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 md:p-padding-card">
        <span className="mb-1 line-clamp-1 font-body-sm text-body-sm text-secondary">
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
            href={buildWhatsAppUrl(whatsappNumber, product)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-btn px-2 py-2.5 font-label-md text-label-md transition-colors sm:gap-2 ${
              ready
                ? "bg-primary text-on-primary hover:bg-inverse-surface"
                : "border border-border-subtle bg-transparent text-on-surface hover:border-primary"
            }`}
          >
            <WhatsAppIcon size={18} className="shrink-0" />
            {/* Label ringkas di HP kecil, lengkap mulai tablet — hindari pecah 3 baris di kartu sempit */}
            <span className="sm:hidden">{ready ? "Pesan" : "Pre-Order"}</span>
            <span className="hidden sm:inline">
              {ready ? "Pesan via WhatsApp" : "Pre-Order via WhatsApp"}
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
