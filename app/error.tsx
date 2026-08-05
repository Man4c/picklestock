"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PickleStock client boundary", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-eyebrow text-eyebrow uppercase text-secondary">
        Terjadi gangguan
      </p>
      <h1 className="mt-3 font-display-md text-display-md text-on-surface">
        Halaman belum dapat dimuat
      </h1>
      <p className="mt-4 font-body-md text-body-md text-secondary">
        Coba muat ulang. Jika masalah berlanjut, kode error di log produksi dapat
        membantu admin menelusurinya.
      </p>
      <Button type="button" onClick={reset} className="mt-7">
        <RefreshCw size={18} aria-hidden="true" />
        Coba Lagi
      </Button>
    </main>
  );
}
