"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { X, Save, UploadCloud } from "lucide-react";
import type { Product } from "@/lib/types";
import { BRANDS, MATERIALS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

type Props = {
  /** null = tambah produk baru */
  product: Product | null;
  onClose: () => void;
};

export function ProductFormModal({ product, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Tutup dengan Escape, dan kunci gulir latar selama modal terbuka.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: simpan ke Supabase (PRD §5.B.2). Kini hanya menutup modal —
    // tidak ada yang tersimpan.
    onClose();
  }

  const labelClass = "mb-1.5 block font-label-md text-label-md text-on-surface";
  const fieldClass =
    "w-full rounded-btn border border-border-subtle bg-surface-input px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-surface-pure shadow-float outline-none"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 id="modal-title" className="font-headline-md text-headline-md">
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <div>
            <label htmlFor="f-name" className={labelClass}>
              Nama Produk
            </label>
            <input
              id="f-name"
              name="name"
              required
              defaultValue={product?.name ?? ""}
              placeholder="Pro Pickleball Paddle Carbon X"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-sku" className={labelClass}>
                SKU
              </label>
              <input
                id="f-sku"
                name="sku"
                required
                defaultValue={product?.sku ?? ""}
                placeholder="PDBL-CBX-01"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-brand" className={labelClass}>
                Merek
              </label>
              <select
                id="f-brand"
                name="brand"
                defaultValue={product?.brand ?? BRANDS[0]}
                className={fieldClass}
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-material" className={labelClass}>
                Bahan
              </label>
              <select
                id="f-material"
                name="material"
                defaultValue={product?.material ?? MATERIALS[0]}
                className={fieldClass}
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-price" className={labelClass}>
                Harga (Rp)
              </label>
              <input
                id="f-price"
                name="price"
                type="number"
                min={0}
                required
                defaultValue={product?.price ?? ""}
                placeholder="2500000"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="f-stock" className={labelClass}>
                Stok
              </label>
              <input
                id="f-stock"
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={product?.stock ?? 0}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-weight" className={labelClass}>
                Berat
              </label>
              <div className="relative">
                <input
                  id="f-weight"
                  name="weight"
                  defaultValue={product?.specs.weight ?? ""}
                  placeholder="7.8 - 8.2"
                  className={`${fieldClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-sm text-status-muted">
                  oz
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="f-thickness" className={labelClass}>
                Ketebalan Inti
              </label>
              <div className="relative">
                <input
                  id="f-thickness"
                  name="thickness"
                  defaultValue={product?.specs.thickness ?? ""}
                  placeholder="16"
                  className={`${fieldClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-sm text-status-muted">
                  mm
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="f-desc" className={labelClass}>
              Deskripsi Produk
            </label>
            <textarea
              id="f-desc"
              name="description"
              defaultValue={product?.description ?? ""}
              placeholder="Tuliskan deskripsi lengkap tentang fitur dan keunggulan raket..."
              className={`${fieldClass} min-h-[120px] resize-y`}
            />
          </div>

          <div>
            <span className={labelClass}>Gambar Produk</span>
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border-subtle bg-surface-input px-4 py-8 text-center">
              <UploadCloud
                size={28}
                aria-hidden="true"
                className="text-status-muted"
              />
              <p className="font-body-sm text-body-sm text-status-muted">
                Unggah gambar tersedia setelah Supabase Storage terpasang.
              </p>
            </div>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-subtle bg-surface-container-low px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="product-form">
            <Save size={16} aria-hidden="true" />
            Simpan Produk
          </Button>
        </div>
      </div>
    </div>
  );
}
