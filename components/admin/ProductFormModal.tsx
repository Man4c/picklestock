"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { X, Save, UploadCloud, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { BRANDS, MATERIALS } from "@/lib/constants";
import { saveProduct } from "@/app/admin/product-actions";
import { INITIAL_PRODUCT_ACTION_STATE } from "@/lib/product-action-state";
import { Button } from "@/components/ui/Button";

type Props = {
  /** null = tambah produk baru */
  product: Product | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function ProductFormModal({ product, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [keptImages, setKeptImages] = useState(product?.images ?? []);
  const [state, formAction, pending] = useActionState(
    saveProduct,
    INITIAL_PRODUCT_ACTION_STATE,
  );

  useEffect(() => {
    if (state.status === "success") onSaved(state.message);
  }, [onSaved, state]);

  // Tutup dengan Escape, dan kunci gulir latar selama modal terbuka.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, pending]);

  const labelClass = "mb-1.5 block font-label-md text-label-md text-on-surface";
  const fieldClass =
    "w-full rounded-btn border border-border-subtle bg-surface-input px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !pending && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-surface-pure shadow-float outline-none"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h2 id="modal-title" className="font-headline-md text-headline-md">
              {product ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">
              {product
                ? "Perbarui informasi katalog dan stok produk."
                : "Lengkapi informasi produk sebelum ditampilkan di katalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Tutup"
            className="rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form
          id="product-form"
          action={formAction}
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <input type="hidden" name="productId" value={product?.id ?? ""} />
          <input
            type="hidden"
            name="existingImages"
            value={JSON.stringify(keptImages)}
          />

          {state.status === "error" && (
            <p
              role="alert"
              className="rounded-btn bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
            >
              {state.message}
            </p>
          )}

          <div>
            <label htmlFor="f-name" className={labelClass}>
              Nama Produk
            </label>
            <input
              id="f-name"
              name="name"
              required
              maxLength={120}
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
                maxLength={60}
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
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
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
                {MATERIALS.map((material) => (
                  <option key={material} value={material}>
                    {material}
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
                step={1}
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
                step={1}
                required
                defaultValue={product?.stock ?? 0}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-weight" className={labelClass}>
                Berat
              </label>
              <input
                id="f-weight"
                name="weight"
                required
                defaultValue={product?.specs.weight ?? ""}
                placeholder="7.8 - 8.2 oz"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-thickness" className={labelClass}>
                Ketebalan Inti
              </label>
              <input
                id="f-thickness"
                name="thickness"
                required
                defaultValue={product?.specs.thickness ?? ""}
                placeholder="16 mm"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-surface" className={labelClass}>
                Permukaan
              </label>
              <input
                id="f-surface"
                name="surface"
                required
                defaultValue={product?.specs.surface ?? ""}
                placeholder="Raw Carbon Fiber"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="f-core" className={labelClass}>
                Inti
              </label>
              <input
                id="f-core"
                name="core"
                required
                defaultValue={product?.specs.core ?? ""}
                placeholder="Polymer Honeycomb"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="f-desc" className={labelClass}>
              Deskripsi Produk
            </label>
            <textarea
              id="f-desc"
              name="description"
              required
              maxLength={2000}
              defaultValue={product?.description ?? ""}
              placeholder="Tuliskan fitur dan keunggulan produk."
              className={`${fieldClass} min-h-[120px] resize-y`}
            />
          </div>

          <div>
            <label htmlFor="f-images" className={labelClass}>
              Gambar Produk
            </label>

            {keptImages.length > 0 && (
              <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {keptImages.map((imageUrl, index) => (
                  <li
                    key={imageUrl}
                    className="group relative aspect-square overflow-hidden rounded-btn border border-border-subtle bg-surface-input"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Gambar produk ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 40vw, 140px"
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setKeptImages((images) =>
                          images.filter((item) => item !== imageUrl),
                        )
                      }
                      aria-label={`Hapus gambar ${index + 1}`}
                      className="absolute right-2 top-2 rounded-btn bg-surface-pure p-2 text-error shadow-soft transition-transform hover:scale-105"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label
              htmlFor="f-images"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed border-border-subtle bg-surface-input px-4 py-6 text-center transition-colors hover:border-primary"
            >
              <UploadCloud size={28} aria-hidden="true" className="text-secondary" />
              <span className="font-label-md text-label-md text-on-surface">
                Pilih gambar
              </span>
              <span className="font-body-sm text-body-sm text-status-muted">
                JPG, PNG, atau WebP · maksimal 4 gambar · 5 MB per gambar
              </span>
            </label>
            <input
              id="f-images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-subtle bg-surface-container-low px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={pending}
          >
            Batal
          </Button>
          <Button type="submit" form="product-form" disabled={pending}>
            <Save size={16} aria-hidden="true" />
            {pending ? "Menyimpan…" : "Simpan Produk"}
          </Button>
        </div>
      </div>
    </div>
  );
}
