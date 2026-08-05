"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { deleteProduct } from "@/app/admin/product-actions";
import { INITIAL_PRODUCT_ACTION_STATE } from "@/lib/product-action-state";
import { Button } from "@/components/ui/Button";

type Props = {
  product: Product;
  onClose: () => void;
  onDeleted: (message: string) => void;
};

export function DeleteProductDialog({ product, onClose, onDeleted }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState(
    deleteProduct,
    INITIAL_PRODUCT_ACTION_STATE,
  );

  useEffect(() => {
    if (state.status === "success") onDeleted(state.message);
  }, [onDeleted, state]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !pending && onClose()}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-card bg-surface-pure p-6 shadow-float outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-error-container text-error">
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Tutup"
            className="rounded-btn p-2 text-secondary hover:bg-surface-container-high disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <h2 id="delete-title" className="mt-5 font-headline-md text-headline-md">
          Hapus produk?
        </h2>
        <p
          id="delete-description"
          className="mt-2 font-body-md text-body-md text-secondary"
        >
          <span className="font-label-md text-label-md text-on-surface">
            {product.name}
          </span>{" "}
          akan dihapus dari katalog bersama gambar yang tersimpan. Tindakan ini
          tidak dapat dibatalkan.
        </p>

        {state.status === "error" && (
          <p
            role="alert"
            className="mt-4 rounded-btn bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
          >
            {state.message}
          </p>
        )}

        <form action={formAction} className="mt-6 flex justify-end gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="bg-error text-on-error hover:bg-on-error-container"
          >
            <Trash2 size={16} aria-hidden="true" />
            {pending ? "Menghapus…" : "Hapus Produk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
