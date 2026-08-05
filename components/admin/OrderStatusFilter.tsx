"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-types";

export function OrderStatusFilter({ value }: { value: OrderStatus | "all" }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <select
      value={value}
      aria-label="Filter status pesanan"
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        if (event.target.value === "all") params.delete("status");
        else params.set("status", event.target.value);
        params.delete("page");
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      }}
      className="rounded-input border border-border-subtle bg-surface-input px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="all">Semua status</option>
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {ORDER_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
