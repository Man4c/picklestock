"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: ganti dengan Supabase Auth (PRD §5.B.1).
    // Saat ini form apa pun diterima — tidak ada autentikasi sama sekali.
    router.push("/admin");
  }

  const fieldClass =
    "w-full rounded-input border border-transparent bg-surface-input py-3 font-body-md text-body-md text-on-surface transition-colors placeholder:text-status-muted focus:border-border-subtle focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <div className="relative">
          <Mail
            size={20}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-status-muted"
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="admin@picklestock.com"
            className={`${fieldClass} pl-12 pr-4`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="sr-only">
          Kata sandi
        </label>
        <div className="relative">
          <Lock
            size={20}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-status-muted"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className={`${fieldClass} pl-12 pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-status-muted transition-colors hover:text-on-surface"
          >
            {showPassword ? (
              <EyeOff size={20} aria-hidden="true" />
            ) : (
              <Eye size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-border-subtle focus:ring-primary"
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Ingat saya
          </span>
        </label>
      </div>

      <Button type="submit" size="lg" fullWidth className="mt-4">
        Masuk ke Dashboard
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
