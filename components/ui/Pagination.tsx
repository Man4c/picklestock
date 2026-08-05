import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  pathname,
  query,
  pageParam = "page",
}: {
  page: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string | undefined>;
  pageParam?: string;
}) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set(pageParam, String(target));
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  }

  const linkClass =
    "inline-flex items-center justify-center gap-1 rounded-btn border border-border-subtle bg-surface-pure px-3 py-2 font-label-md text-label-md text-on-surface transition-colors hover:border-primary";

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-between gap-4 border-t border-border-subtle pt-4"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} scroll={false} className={linkClass}>
          <ChevronLeft size={16} aria-hidden="true" />
          Sebelumnya
        </Link>
      ) : (
        <span className={`${linkClass} invisible`} aria-hidden="true">
          Sebelumnya
        </span>
      )}
      <span className="font-body-sm text-body-sm text-secondary">
        Halaman <strong className="text-on-surface">{page}</strong> dari {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} scroll={false} className={linkClass}>
          Berikutnya
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${linkClass} invisible`} aria-hidden="true">
          Berikutnya
        </span>
      )}
    </nav>
  );
}
