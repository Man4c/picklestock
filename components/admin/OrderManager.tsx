"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { updateOrderStatus } from "@/app/admin/order-actions";
import { formatRupiah } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderPage,
  type OrderStatus,
} from "@/lib/order-types";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearch } from "@/components/ui/ServerSearch";
import { DeleteOrderDialog } from "./DeleteOrderDialog";
import { OrderFormModal } from "./OrderFormModal";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusFilter } from "./OrderStatusFilter";

type ProductOption = { id: string; name: string; price: number };
type ModalState = { open: false } | { open: true; order: Order | null };

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function OrderManager({
  orderPage,
  products,
}: {
  orderPage: OrderPage;
  products: ProductOption[];
}) {
  const { orders, page, total, totalPages, query, status } = orderPage;
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [statusPending, startStatusTransition] = useTransition();

  function changeStatus(orderId: string, nextStatus: OrderStatus) {
    startStatusTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      setNotice({ type: result.status === "error" ? "error" : "success", message: result.message });
    });
  }

  const statusSelectClass =
    "rounded-btn border border-border-subtle bg-surface-input px-2 py-1.5 font-body-sm text-body-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-eyebrow text-eyebrow uppercase text-secondary">Alur penjualan WhatsApp</p>
          <h2 className="mt-1 font-headline-lg text-headline-lg text-on-surface">Manajemen Pesanan</h2>
          <p className="mt-1 font-body-md text-body-md text-secondary">Catat pelanggan, pembayaran, dan pengiriman tanpa mengubah cara pelanggan memesan.</p>
        </div>
        <Button type="button" onClick={() => setModal({ open: true, order: null })} disabled={products.length === 0} className="whitespace-nowrap">
          <Plus size={18} aria-hidden="true" />
          Catat Pesanan
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <ServerSearch initialQuery={query} placeholder="Cari pelanggan, nomor, atau produk..." />
        <OrderStatusFilter value={status} />
      </div>

      {notice && (
        <div role={notice.type === "error" ? "alert" : "status"} className={`flex items-center justify-between gap-4 rounded-btn px-4 py-3 font-body-sm text-body-sm ${notice.type === "error" ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface"}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-label-md underline underline-offset-2">Tutup</button>
        </div>
      )}

      <div className="rounded-card border border-border-subtle bg-surface-pure px-4 py-3">
        <p className="font-body-sm text-body-sm text-secondary">
          {total} catatan ditemukan. Status dapat diperbarui langsung setelah transaksi WhatsApp berlangsung.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-subtle bg-surface-pure px-6 py-12 text-center">
          <p className="font-headline-sm text-headline-sm">Belum ada pesanan yang cocok</p>
          <p className="mt-1 font-body-sm text-body-sm text-secondary">Catat pesanan WhatsApp pertama atau ubah filter pencarian.</p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-4 lg:hidden">
            {orders.map((order) => (
              <li key={order.id} className="rounded-card border border-border-subtle bg-surface-pure p-padding-card shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-eyebrow text-eyebrow uppercase text-secondary">{order.orderNumber} · {formatDate(order.orderDate)}</p>
                    <h3 className="mt-1 font-headline-md text-headline-md">{order.customerName}</h3>
                    <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-body-sm text-body-sm text-secondary hover:text-primary">
                      {order.customerPhone}<ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="my-4 border-y border-border-subtle py-3">
                  <p className="font-label-md text-label-md">{order.quantity} × {order.productName}</p>
                  <p className="mt-1 font-price-tag text-price-tag">{formatRupiah(order.totalAmount)}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <select aria-label={`Status ${order.orderNumber}`} value={order.status} disabled={statusPending} onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)} className={statusSelectClass}>
                    {ORDER_STATUSES.map((item) => <option key={item} value={item}>{ORDER_STATUS_LABELS[item]}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <IconButton label={`Edit ${order.orderNumber}`} onClick={() => setModal({ open: true, order })}><Pencil size={19} aria-hidden="true" /></IconButton>
                    <IconButton label={`Hapus ${order.orderNumber}`} onClick={() => setDeleteTarget(order)} className="hover:bg-error-container hover:text-error"><Trash2 size={19} aria-hidden="true" /></IconButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-card border border-border-subtle bg-surface-pure shadow-soft lg:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-border-subtle bg-surface-container-low font-eyebrow text-eyebrow uppercase text-secondary">
                  <tr><th className="px-4 py-3">Pesanan</th><th className="px-4 py-3">Pelanggan</th><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-surface-container-low/50">
                      <td className="px-4 py-4"><p className="font-label-md text-label-md">{order.orderNumber}</p><p className="font-body-sm text-body-sm text-secondary">{formatDate(order.orderDate)}</p></td>
                      <td className="px-4 py-4"><p className="font-label-md text-label-md">{order.customerName}</p><a href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="font-body-sm text-body-sm text-secondary hover:text-primary">{order.customerPhone}</a></td>
                      <td className="max-w-56 px-4 py-4"><p className="truncate font-body-md text-body-md">{order.productName}</p><p className="font-body-sm text-body-sm text-secondary">{order.quantity} × {formatRupiah(order.unitPrice)}</p></td>
                      <td className="px-4 py-4 font-price-tag text-price-tag">{formatRupiah(order.totalAmount)}</td>
                      <td className="px-4 py-4"><select aria-label={`Status ${order.orderNumber}`} value={order.status} disabled={statusPending} onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)} className={statusSelectClass}>{ORDER_STATUSES.map((item) => <option key={item} value={item}>{ORDER_STATUS_LABELS[item]}</option>)}</select></td>
                      <td className="px-4 py-4"><div className="flex justify-end gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"><IconButton label={`Edit ${order.orderNumber}`} onClick={() => setModal({ open: true, order })}><Pencil size={19} aria-hidden="true" /></IconButton><IconButton label={`Hapus ${order.orderNumber}`} onClick={() => setDeleteTarget(order)} className="hover:bg-error-container hover:text-error"><Trash2 size={19} aria-hidden="true" /></IconButton></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} pathname="/admin/orders" query={{ q: query || undefined, status: status === "all" ? undefined : status }} />

      {modal.open && <OrderFormModal key={modal.order?.id ?? "new-order"} order={modal.order} products={products} onClose={() => setModal({ open: false })} onSaved={(message) => { setModal({ open: false }); setNotice({ type: "success", message }); }} />}
      {deleteTarget && <DeleteOrderDialog key={deleteTarget.id} order={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={(message) => { setDeleteTarget(null); setNotice({ type: "success", message }); }} />}
    </>
  );
}
