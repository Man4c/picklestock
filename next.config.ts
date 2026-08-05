import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Empat gambar @ 5 MB + overhead multipart.
      bodySizeLimit: "21mb",
    },
  },
  images: {
    remotePatterns: supabaseUrl
      ? [new URL(`${supabaseUrl}/storage/v1/object/public/product-images/**`)]
      : [],
  },
};

export default nextConfig;
