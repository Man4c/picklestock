import Link from "next/link";
import { User } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function TopNav() {
  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-margin-page backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-display-logo text-display-logo tracking-tighter text-primary"
        >
          {SITE_NAME}
        </Link>
        <div className="hidden gap-6 md:flex">
          <Link
            href="/"
            className="border-b-2 border-primary pb-[21px] pt-[21px] font-label-md text-label-md font-bold text-primary"
          >
            Shop
          </Link>
          {/* Belum ada halamannya — teks biasa, bukan tautan mati */}
          <span className="py-[21px] font-label-md text-label-md text-status-muted">
            Brands
          </span>
          <span className="py-[21px] font-label-md text-label-md text-status-muted">
            Community
          </span>
        </div>
      </div>
      <Link
        href="/admin/login"
        aria-label="Masuk sebagai admin"
        title="Masuk sebagai admin"
        className="inline-flex items-center justify-center rounded-full p-2 text-primary transition-colors hover:bg-surface-variant/50"
      >
        <User size={20} aria-hidden="true" />
      </Link>
    </nav>
  );
}
