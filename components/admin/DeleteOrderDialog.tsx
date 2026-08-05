"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteOrder } from "@/app/admin/order-actions";
import { INITIAL_ORDER_ACTION_STATE, type Order } from "@/lib/order-types";
import { Button } from "@/components/ui/Button";

export function DeleteOrderDialog({
  order,
  onClose,
  onDeleted,
}: {
  order: Order;
  onClose: () => void;
  onDeleted: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState(
    deleteOrder,
    INITIAL_ORDER_ACTION_STATE,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !pending && onClose()}>
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="delete-order-title" tabIndex={-1} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-card bg-surface-pure p-6 shadow-float outline-none">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-card bg-error-container text-error">
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <button type="button" onClick={onClose} disabled={pending} aria-label="Tutup" className="rounded-btn p-2 text-secondary hover:bg-surface-container-high">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <h2 id="delete-order-title" className="mt-5 font-headline-md text-headline-md">Hapus catatan pesanan?</h2>
        <p className="mt-2 font-body-md text-body-md text-secondary">
          {order.orderNumber} milik <span className="font-label-md text-on-surface">{order.customerName}</span> akan dihapus permanen.
        </p>
        {state.status === "error" && <p role="alert" className="mt-4 rounded-btn bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container">{state.message}</p>}
        <form action={formAction} className="mt-6 flex justify-end gap-3">
          <input type="hidden" name="orderId" value={order.id} />
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>Batal</Button>
          <Button type="submit" disabled={pending} className="bg-error text-on-error hover:bg-on-error-container">
            <Trash2 size={16} aria-hidden="true" />
            {pending ? "Menghapus…" : "Hapus Catatan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
