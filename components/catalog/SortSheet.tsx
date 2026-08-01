"use client";

import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import type { SortOption } from "@/lib/types";
import { SORT_OPTIONS } from "@/lib/constants";

type Props = {
  value: SortOption;
  onSelect: (next: SortOption) => void;
  onClose: () => void;
};

/**
 * Sheet kecil khusus memilih urutan — dipisah dari FilterSheet supaya tombol
 * "Urutkan" langsung menampilkan 4 pilihan urutan, bukan sheet filter penuh.
 * Pola konvensi Tokopedia/Shopee. Memilih satu opsi langsung menutup sheet.
 *
 * Cangkang (overlay, Escape, kunci scroll, tutup saat lebar ke lg) meniru
 * FilterSheet agar perilakunya konsisten.
 */
export function SortSheet({ value, onSelect, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

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
        aria-labelledby="sort-sheet-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-card bg-surface-pure shadow-float outline-none"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-margin-page py-4">
          <h2 id="sort-sheet-title" className="font-headline-md text-headline-md">
            Urutkan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup urutkan"
            className="rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <ul className="overflow-y-auto py-2" role="radiogroup" aria-label="Urutkan produk">
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between px-margin-page py-3.5 text-left font-body-md text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  <span className={active ? "font-label-md" : undefined}>
                    {opt.label}
                  </span>
                  {active && (
                    <Check size={20} aria-hidden="true" className="text-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
