import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-level1 p-margin-page">
      <main className="w-full max-w-[400px]">
        <div className="flex flex-col gap-stack-section rounded-card border border-border-subtle bg-surface-pure p-6 shadow-card">
          <header className="flex flex-col gap-2 text-center">
            <h1 className="font-display-logo text-display-logo text-status-available">
              {SITE_NAME} Admin
            </h1>
            <p className="font-body-md text-body-md text-muted">
              Silakan masuk untuk mengelola stok &amp; produk.
            </p>
          </header>
          <LoginForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke Katalog Publik
          </Link>
        </div>
      </main>
    </div>
  );
}
