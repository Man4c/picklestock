import type { ReactNode } from "react";
import type { StockStatus } from "@/lib/types";

type Props = {
  status: StockStatus;
  children: ReactNode;
};

/** Label pil status stok. Ready: isi gelap; pre-order: abu redup. */
export function Badge({ status, children }: Props) {
  const tone =
    status === "ready"
      ? "bg-status-available text-on-primary"
      : "bg-surface-dim text-secondary border border-border-subtle";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 font-eyebrow text-eyebrow uppercase ${tone}`}
    >
      {children}
    </span>
  );
}
