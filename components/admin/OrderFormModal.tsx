"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { saveOrder } from "@/app/admin/order-actions";
import {
  INITIAL_ORDER_ACTION_STATE,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type Order,
} from "@/lib/order-types";
import { Button } from "@/components/ui/Button";

type ProductOption = { id: string; name: string; price: number };

function todayLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function OrderFormModal({
  order,
  products,
  onClose,
  onSaved,
}: {
  order: Order | null;
  products: ProductOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialProduct = useMemo(
    () => products.find((product) => product.id === order?.productId) ?? products[0],
    [order?.productId, products],
  );
  const [selectedProductId, setSelectedProductId] = useState(
    order?.productId ?? initialProduct?.id ?? "",
  );
  const [unitPrice, setUnitPrice] = useState(order?.unitPrice ?? initialProduct?.price ?? 0);
  const [state, formAction, pending] = useActionState(
    saveOrder,
    INITIAL_ORDER_ACTION_STATE,
  );
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  useEffect(() => {
    if (state.status === "success") onSaved(state.message);
  }, [onSaved, state]);

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
        aria-labelledby="order-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-surface-pure shadow-float outline-none"
      >
        <header className="flex items-start justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <p className="font-eyebrow text-eyebrow uppercase text-secondary">Catatan WhatsApp</p>
            <h2 id="order-modal-title" className="mt-1 font-headline-md text-headline-md">
              {order ? `Edit ${order.orderNumber}` : "Catat Pesanan Baru"}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={pending} aria-label="Tutup" className="rounded-btn p-2 text-secondary hover:bg-surface-container-high">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form id="order-form" action={formAction} className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <input type="hidden" name="orderId" value={order?.id ?? ""} />
          <input type="hidden" name="productName" value={selectedProduct?.name ?? order?.productName ?? ""} />
          {state.status === "error" && (
            <p role="alert" className="rounded-btn bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container">
              {state.message}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="order-customer" className={labelClass}>Nama Pelanggan</label>
              <input id="order-customer" name="customerName" required maxLength={120} defaultValue={order?.customerName ?? ""} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="order-phone" className={labelClass}>Nomor WhatsApp</label>
              <input id="order-phone" name="customerPhone" required inputMode="tel" defaultValue={order?.customerPhone ?? ""} placeholder="0812 3456 7890" className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="order-product" className={labelClass}>Produk</label>
            <select
              id="order-product"
              name="productId"
              value={selectedProductId}
              onChange={(event) => {
                const nextId = event.target.value;
                setSelectedProductId(nextId);
                const product = products.find((item) => item.id === nextId);
                if (product) setUnitPrice(product.price);
              }}
              className={fieldClass}
            >
              {order && !order.productId && (
                <option value="">{order.productName} (produk sudah dihapus)</option>
              )}
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="order-qty" className={labelClass}>Jumlah</label>
              <input id="order-qty" name="quantity" type="number" min={1} required defaultValue={order?.quantity ?? 1} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="order-price" className={labelClass}>Harga Satuan</label>
              <input id="order-price" name="unitPrice" type="number" min={0} required value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="order-date" className={labelClass}>Tanggal</label>
              <input id="order-date" name="orderDate" type="date" required defaultValue={order?.orderDate ?? todayLocal()} className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="order-status" className={labelClass}>Status</label>
            <select id="order-status" name="status" defaultValue={order?.status ?? "new"} className={fieldClass}>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="order-notes" className={labelClass}>Catatan</label>
            <textarea id="order-notes" name="notes" maxLength={1000} defaultValue={order?.notes ?? ""} placeholder="Alamat, warna pilihan, atau catatan pembayaran." className={`${fieldClass} min-h-24 resize-y`} />
          </div>
        </form>

        <footer className="flex justify-end gap-3 border-t border-border-subtle bg-surface-container-low px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>Batal</Button>
          <Button type="submit" form="order-form" disabled={pending || products.length === 0}>
            <Save size={16} aria-hidden="true" />
            {pending ? "Menyimpan…" : "Simpan Pesanan"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
