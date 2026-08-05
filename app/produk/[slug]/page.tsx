import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };

  const description = product.description.slice(0, 155);
  const images = product.images.map((url) => ({
    url,
    alt: `${product.name} — ${product.brand}`,
  }));

  return {
    title: product.name,
    description,
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/produk/${product.slug}`,
      title: product.name,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, whatsappNumber] = await Promise.all([
    getProductBySlug(slug),
    getWhatsAppNumber(),
  ]);
  if (!product) notFound();

  return (
    <>
      <TopNav />
      <ProductDetail product={product} whatsappNumber={whatsappNumber} />
      <Footer />
    </>
  );
}
