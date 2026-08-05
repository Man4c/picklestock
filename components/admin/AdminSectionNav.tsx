import Link from "next/link";
import { Boxes, ClipboardList } from "lucide-react";

export function AdminSectionNav({ active }: { active: "products" | "orders" }) {
  const items = [
    { key: "products" as const, href: "/admin", label: "Produk", icon: Boxes },
    {
      key: "orders" as const,
      href: "/admin/orders",
      label: "Pesanan & Penjualan",
      icon: ClipboardList,
    },
  ];

  return (
    <nav aria-label="Bagian dashboard" className="flex gap-2 overflow-x-auto">
      {items.map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
          className={`inline-flex shrink-0 items-center gap-2 rounded-btn px-4 py-2.5 font-label-md text-label-md transition-colors ${
            active === key
              ? "bg-primary text-on-primary"
              : "border border-border-subtle bg-surface-pure text-secondary hover:border-primary hover:text-primary"
          }`}
        >
          <Icon size={17} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
