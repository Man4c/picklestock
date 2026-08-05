import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/produk/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
