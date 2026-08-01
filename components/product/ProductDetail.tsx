import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatRupiah, buildWhatsAppUrl } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ProductGallery } from "./ProductGallery";
import { SpecGrid } from "./SpecGrid";

export function ProductDetail({ product }: { product: Product }) {
  const ready = product.status === "ready";
  const waUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, product);
  const ctaLabel = ready ? "Pesan via WhatsApp" : "Pre-Order via WhatsApp";

  return (
    <>
      <main className="mx-auto max-w-7xl px-margin-page pb-32 pt-24 md:pb-12">
        <nav aria-label="Remah roti" className="mb-6">
          <ol className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Katalog
              </Link>
            </li>
            <li aria-hidden="true" className="flex items-center">
              <ChevronRight size={14} />
            </li>
            <li>
              <span className="text-secondary">{product.brand}</span>
            </li>
            <li aria-hidden="true" className="flex items-center">
              <ChevronRight size={14} />
            </li>
            <li>
              <span className="text-on-surface" aria-current="page">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-stack-section md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-6 py-4 md:pl-8">
            <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
              <span className="font-eyebrow text-eyebrow uppercase tracking-widest text-secondary">
                {product.brand}
              </span>
              <h1 className="mt-1 font-headline-lg text-headline-lg text-on-surface">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-price-tag text-2xl text-on-surface">
                  {formatRupiah(product.price)}
                </span>
                <Badge status={product.status}>
                  {ready ? "Tersedia" : "Pre-Order"}
                </Badge>
              </div>
            </div>

            <SpecGrid specs={product.specs} />

            <div className="border-t border-border-subtle pt-4">
              <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">
                Tentang Produk
              </h2>
              <p className="font-body-md text-body-md leading-relaxed text-secondary">
                {product.description}
              </p>
            </div>

            {/* CTA desktop — versi mobile ada di bilah tetap di bawah */}
            <div className="mt-6 hidden flex-col gap-3 md:flex">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-inverse-surface"
              >
                <WhatsAppIcon size={20} />
                {ctaLabel}
              </a>
              <p className="text-center font-body-sm text-body-sm text-status-muted">
                Anda akan diarahkan ke WhatsApp untuk konfirmasi pesanan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bilah CTA tetap — hanya mobile */}
      <div className="pb-safe fixed bottom-0 z-50 w-full border-t border-border-subtle bg-surface-pure p-padding-card md:hidden">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-3.5 font-label-md text-label-md text-on-primary transition-transform active:scale-[0.98]"
        >
          <WhatsAppIcon size={20} />
          {ctaLabel}
        </a>
      </div>
    </>
  );
}
