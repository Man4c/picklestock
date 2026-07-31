import type { Product } from "./types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 2500000 → "Rp2.500.000" */
export function formatRupiah(value: number): string {
  return rupiah.format(value).replace(/\s/g, "");
}

/**
 * Tautan wa.me dengan pesan otomatis. Format mengikuti PRD §5.A.4 —
 * kalimatnya berbeda antara pesanan biasa dan pre-order.
 */
export function buildWhatsAppUrl(phone: string, product: Product): string {
  const harga = formatRupiah(product.price);
  const text =
    product.status === "ready"
      ? `Halo Admin, saya mau pesan raket ${product.name} (${harga}). Apakah stoknya masih ada?`
      : `Halo Admin, saya mau Pre-Order raket ${product.name} (${harga}). Kapan estimasi stoknya tersedia?`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
