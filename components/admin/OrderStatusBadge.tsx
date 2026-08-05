import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const classes: Record<OrderStatus, string> = {
    new: "border-border-subtle bg-surface-input text-on-surface",
    confirmed: "border-outline-variant bg-surface-container-low text-on-surface",
    paid: "border-primary bg-primary text-on-primary",
    shipped: "border-outline bg-surface-container-high text-on-surface",
    completed: "border-status-available bg-surface-pure text-status-available",
    cancelled: "border-error bg-error-container text-on-error-container",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 font-eyebrow text-eyebrow uppercase ${classes[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
