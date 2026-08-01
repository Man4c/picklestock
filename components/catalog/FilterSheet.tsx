"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { EMPTY_FILTERS, type Filters } from "@/lib/filter";
import { Button } from "@/components/ui/Button";
import { FilterSidebar } from "./FilterSidebar";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  /** Jumlah produk yang cocok saat ini — ditampilkan live di header & footer. */
  resultCount: number;
  onClose: () => void;
};

/**
 * Bottom sheet berisi seluruh kontrol filter untuk HP & tablet (di bawah lg,
 * tempat sidebar desktop tersembunyi). Isinya memakai ulang <FilterSidebar>
 * yang sama — satu sumber kebenaran, tanpa duplikasi kontrol.
 *
 * Filter berlaku live: setiap perubahan langsung memfilter daftar di belakang
 * sheet, jadi footer hanya menutup (bukan "menerapkan"). Pola overlay/Escape/
 * kunci-scroll mengikuti ProductFormModal agar konsisten.
 */
export function FilterSheet({ filters, onChange, resultCount, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    // Sheet hanya untuk layar di bawah lg (panelnya `lg:hidden`). Bila viewport
    // melebar ke lg saat sheet terbuka (rotasi tablet / resize), tutup — jika
    // tidak, komponen tetap ter-mount, scroll-lock body bocor ke tampilan
    // desktop, dan sheet muncul lagi begitu layar mengecil tanpa diminta.
    const lg = window.matchMedia("(min-width: 1024px)");
    function onViewportChange() {
      if (lg.matches) onClose();
    }
    lg.addEventListener("change", onViewportChange);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      lg.removeEventListener("change", onViewportChange);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-card bg-surface-pure shadow-float outline-none"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-margin-page py-4">
          <div>
            <h2
              id="filter-sheet-title"
              className="font-headline-md text-headline-md"
            >
              Filter
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">
              {resultCount} hasil
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="font-label-md text-label-md text-primary transition-colors hover:underline"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup filter"
              className="rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-margin-page py-5">
          <FilterSidebar filters={filters} onChange={onChange} showSort={false} />
        </div>

        <div className="shrink-0 border-t border-border-subtle px-margin-page py-4">
          <Button type="button" fullWidth size="lg" onClick={onClose}>
            Lihat {resultCount} hasil
          </Button>
        </div>
      </div>
    </div>
  );
}
