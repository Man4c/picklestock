import {
  Boxes,
  ChevronRight,
  CircleDollarSign,
  PackageSearch,
  Trophy,
  TriangleAlert,
} from "lucide-react";
import type { AdminDashboardSummary } from "@/lib/admin-dashboard";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-dashboard";
import { formatRupiah } from "@/lib/format";

export function AdminOverview({
  summary,
}: {
  summary: AdminDashboardSummary;
}) {
  const metrics = [
    {
      label: "Total stok",
      value: summary.totalStock.toLocaleString("id-ID"),
      detail: `${summary.totalProducts} produk aktif`,
      icon: Boxes,
    },
    {
      label: "Nilai inventaris",
      value: formatRupiah(summary.inventoryValue),
      detail: "Harga jual × stok tersedia",
      icon: CircleDollarSign,
    },
    {
      label: "Perlu perhatian",
      value: summary.lowStockCount.toLocaleString("id-ID"),
      detail: `Stok ${LOW_STOCK_THRESHOLD} unit atau kurang`,
      icon: TriangleAlert,
    },
  ];

  return (
    <section aria-labelledby="overview-title" className="flex flex-col gap-4">
      <div>
        <p className="font-eyebrow text-eyebrow uppercase text-secondary">
          Ringkasan hari ini
        </p>
        <h1
          id="overview-title"
          className="mt-1 font-headline-lg text-headline-lg text-on-surface"
        >
          Kondisi Inventaris
        </h1>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <div
            key={label}
            className="rounded-card border border-border-subtle bg-surface-pure p-padding-card shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <dt className="font-label-md text-label-md text-secondary">
                {label}
              </dt>
              <span className="rounded-btn bg-surface-level1 p-2 text-on-surface">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <dd className="mt-5 break-words font-headline-lg text-headline-lg text-on-surface">
              {value}
            </dd>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">
              {detail}
            </p>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <article className="overflow-hidden rounded-card border border-border-subtle bg-surface-pure shadow-soft">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-padding-card py-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Produk Hampir Habis
              </h2>
              <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                Prioritas pengadaan ulang, stok paling sedikit di atas.
              </p>
            </div>
            <PackageSearch className="shrink-0 text-secondary" size={21} aria-hidden="true" />
          </div>

          {summary.lowStockProducts.length === 0 ? (
            <div className="px-padding-card py-8 text-center">
              <p className="font-label-md text-label-md text-on-surface">
                Semua stok masih aman
              </p>
              <p className="mt-1 font-body-sm text-body-sm text-secondary">
                Tidak ada produk dengan stok {LOW_STOCK_THRESHOLD} unit atau kurang.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {summary.lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-padding-card py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-label-md text-label-md text-on-surface">
                      {product.name}
                    </p>
                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="grid w-16 grid-cols-3 gap-1"
                      aria-label={`Stok ${product.stock} unit`}
                    >
                      {Array.from({ length: LOW_STOCK_THRESHOLD }, (_, index) => (
                        <span
                          key={index}
                          aria-hidden="true"
                          className={`h-1.5 rounded-full ${
                            index < product.stock
                              ? "bg-primary"
                              : "bg-surface-container-highest"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`min-w-14 rounded-btn px-2 py-1 text-center font-label-md text-label-md ${
                        product.stock === 0
                          ? "bg-error-container text-on-error-container"
                          : "bg-surface-level1 text-on-surface"
                      }`}
                    >
                      {product.stock === 0 ? "Habis" : `${product.stock} unit`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-card bg-primary p-padding-card text-on-primary shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-eyebrow text-eyebrow uppercase text-on-primary-container">
                Penjualan selesai
              </p>
              <h2 className="mt-1 font-headline-md text-headline-md">
                Produk Terlaris
              </h2>
            </div>
            <Trophy size={24} aria-hidden="true" />
          </div>

          {summary.bestSellers.length === 0 ? (
            <div className="mt-8 rounded-btn border border-on-primary-container p-4">
              <p className="font-label-md text-label-md">Belum ada data penjualan</p>
              <p className="mt-1 font-body-sm text-body-sm text-on-primary-container">
                Produk terlaris muncul setelah pesanan berstatus Selesai.
              </p>
            </div>
          ) : (
            <ol className="mt-6 flex flex-col gap-2">
              {summary.bestSellers.map((seller, index) => (
                <li
                  key={seller.key}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-btn bg-inverse-surface px-3 py-3"
                >
                  <span className="font-headline-sm text-headline-sm text-on-primary-container">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate font-label-md text-label-md">
                    {seller.name}
                  </span>
                  <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-primary-container">
                    {seller.unitsSold.toLocaleString("id-ID")} unit
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </article>
      </div>
    </section>
  );
}
