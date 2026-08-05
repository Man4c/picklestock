"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard / Ringkasan",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Manajemen Produk",
    icon: Boxes,
  },
  {
    href: "/admin/orders",
    label: "Pesanan & Penjualan",
    icon: ClipboardList,
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Tutup menu admin" : "Buka menu admin"}
        aria-expanded={open}
        aria-controls="admin-sidebar"
        onClick={() => setOpen((current) => !current)}
        className="fixed left-margin-page top-3 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-btn border border-border-subtle bg-surface-pure text-on-surface shadow-soft lg:hidden"
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {open && (
        <button
          type="button"
          aria-label="Tutup menu admin"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary text-on-primary transition-transform duration-200 lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-on-primary-container px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-on-primary text-primary">
            <Image
              src="/icon.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-btn"
            />
          </span>
          <div>
            <p className="font-display-logo text-display-logo tracking-tighter">
              {SITE_NAME}
            </p>
            <p className="font-eyebrow text-eyebrow uppercase text-on-primary-container">
              Admin control
            </p>
          </div>
        </div>

        <nav aria-label="Navigasi admin" className="flex flex-1 flex-col gap-2 px-4 py-6">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-btn px-4 py-3 font-label-md text-label-md transition-colors ${
                  active
                    ? "bg-on-primary text-primary"
                    : "text-on-primary-container hover:bg-inverse-surface hover:text-on-primary"
                }`}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-on-primary-container px-6 py-5">
          <p className="font-eyebrow text-eyebrow uppercase text-on-primary-container">
            Inventory workspace
          </p>
          <p className="mt-1 font-body-sm text-body-sm text-on-primary-container">
            Stok dan penjualan dalam satu kendali.
          </p>
        </div>
      </aside>
    </>
  );
}
