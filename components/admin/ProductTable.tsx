"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ProductFormModal } from "./ProductFormModal";

type ModalState = { open: false } | { open: true; product: Product | null };

export function ProductTable({ products }: { products: Product[] }) {
  // Stok hanya hidup di state — semua perubahan hilang saat halaman dimuat
  // ulang. Ini disengaja sampai Supabase terpasang, bukan bug.
  const [stocks, setStocks] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((p) => [p.id, p.stock])),
  );
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [phone, setPhone] = useState(WHATSAPP_NUMBER);

  const thClass =
    "px-padding-card py-3 font-eyebrow text-eyebrow uppercase text-secondary";

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Manajemen Stok Produk
          </h2>
          <p className="mt-1 font-body-md text-body-md text-secondary">
            Kelola inventaris dan harga raket pickleball Anda.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setModal({ open: true, product: null })}
          className="whitespace-nowrap shadow-soft"
        >
          <Plus size={18} aria-hidden="true" />
          Tambah Produk Baru
        </Button>
      </div>

      {/* Pengaturan WhatsApp — mobile */}
      <div className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface-pure p-padding-card shadow-soft md:hidden">
        <label
          htmlFor="wa-mobile"
          className="flex items-center gap-2 font-label-md text-label-md text-on-surface"
        >
          <WhatsAppIcon size={16} className="text-secondary" />
          Nomor WhatsApp Admin
        </label>
        {/* Tumpuk di layar sempit (tombol penuh-lebar), sejajar di >= sm. */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="wa-mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 w-full rounded-input border border-border-subtle bg-surface-input px-4 font-body-sm text-body-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:flex-1"
          />
          <Button type="button" className="h-10 w-full sm:w-auto">
            Simpan
          </Button>
        </div>
      </div>

      {/* Daftar kartu — mobile & tablet (< lg). Tabel lebar-tetap tidak muat di
          layar sempit: bikin dokumen melebar (white space) dan menyembunyikan
          kolom Harga/Aksi. Aksi di sini selalu terlihat (layar sentuh tak punya
          hover). */}
      <ul className="flex flex-col gap-4 lg:hidden">
        {products.map((product) => {
          const stock = stocks[product.id];
          const ready = stock > 0;
          return (
            <li
              key={product.id}
              className="rounded-card border border-border-subtle bg-surface-pure p-padding-card shadow-soft"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-btn border border-border-subtle bg-surface-input">
                  <Image
                    src={product.images[0]}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-headline-sm text-headline-sm text-on-surface">
                    {product.name}
                  </div>
                  <div className="mt-0.5 font-body-sm text-body-sm text-secondary">
                    {product.brand} · SKU: {product.sku}
                  </div>
                  <div className="mt-2 font-price-tag text-price-tag text-on-surface">
                    {formatRupiah(product.price)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`stok-m-${product.id}`}
                    className="font-label-md text-label-md text-secondary"
                  >
                    Stok
                  </label>
                  <input
                    id={`stok-m-${product.id}`}
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) =>
                      setStocks((s) => ({
                        ...s,
                        [product.id]: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-20 rounded-btn border border-border-subtle bg-surface-input px-2 py-1 text-center font-body-md text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Badge status={ready ? "ready" : "preorder"}>
                    {ready ? "Ready Stock" : "Pre-Order"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton
                    label={`Edit ${product.name}`}
                    onClick={() => setModal({ open: true, product })}
                  >
                    <Pencil size={20} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Hapus ${product.name}`}
                    className="hover:bg-error-container hover:text-error"
                  >
                    <Trash2 size={20} aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Tabel — desktop (lg+) */}
      <div className="hidden overflow-hidden rounded-card border border-border-subtle bg-surface-pure shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-low">
                <th scope="col" className={`${thClass} w-16`}>
                  Gambar
                </th>
                <th scope="col" className={thClass}>
                  Detail Produk
                </th>
                <th scope="col" className={thClass}>
                  Merek
                </th>
                <th scope="col" className={thClass}>
                  Harga
                </th>
                <th scope="col" className={`${thClass} w-24`}>
                  Stok
                </th>
                <th scope="col" className={thClass}>
                  Status
                </th>
                <th scope="col" className={`${thClass} text-right`}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map((product) => {
                const stock = stocks[product.id];
                const ready = stock > 0;
                return (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-padding-card py-4">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-btn border border-border-subtle bg-surface-input">
                        <Image
                          src={product.images[0]}
                          alt=""
                          width={48}
                          height={48}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-padding-card py-4">
                      <div className="font-headline-sm text-headline-sm text-on-surface">
                        {product.name}
                      </div>
                      <div className="mt-0.5 font-body-sm text-body-sm text-secondary">
                        SKU: {product.sku}
                      </div>
                    </td>
                    <td className="px-padding-card py-4 font-body-sm text-body-sm text-on-surface">
                      {product.brand}
                    </td>
                    <td className="px-padding-card py-4 font-price-tag text-price-tag text-on-surface">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-padding-card py-4">
                      <label htmlFor={`stok-${product.id}`} className="sr-only">
                        Stok {product.name}
                      </label>
                      <input
                        id={`stok-${product.id}`}
                        type="number"
                        min={0}
                        value={stock}
                        onChange={(e) =>
                          setStocks((s) => ({
                            ...s,
                            [product.id]: Math.max(0, Number(e.target.value)),
                          }))
                        }
                        className="w-full rounded-btn border border-border-subtle bg-surface-input px-2 py-1 text-center font-body-md text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-padding-card py-4">
                      <Badge status={ready ? "ready" : "preorder"}>
                        {ready ? "Ready Stock" : "Pre-Order"}
                      </Badge>
                    </td>
                    <td className="px-padding-card py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <IconButton
                          label={`Edit ${product.name}`}
                          onClick={() => setModal({ open: true, product })}
                        >
                          <Pencil size={20} aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Hapus ${product.name}`}
                          className="hover:bg-error-container hover:text-error"
                        >
                          <Trash2 size={20} aria-hidden="true" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginasi — berlaku untuk kartu maupun tabel */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-card border border-border-subtle bg-surface-container-low p-padding-card sm:flex-row sm:items-center">
        <span className="font-body-sm text-body-sm text-secondary">
          Menampilkan {products.length} dari {products.length} produk
        </span>
        <div className="flex gap-2">
          {/* Paginasi menyusul bersama Supabase; mockup pun menggambarkannya mati */}
          <Button variant="secondary" size="sm" disabled>
            Sebelumnya
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Berikutnya
          </Button>
        </div>
      </div>

      {modal.open && (
        <ProductFormModal
          product={modal.product}
          onClose={() => setModal({ open: false })}
        />
      )}
    </>
  );
}
