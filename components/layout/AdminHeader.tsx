"use client";

import { useState } from "react";
import { Phone, LogOut } from "lucide-react";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { logout } from "@/app/admin/actions";

export function AdminHeader() {
  const [phone, setPhone] = useState(WHATSAPP_NUMBER);

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-margin-page backdrop-blur-md">
      <h1 className="font-display-logo text-display-logo tracking-tighter text-primary">
        {SITE_NAME} Admin
      </h1>

      {/* Pengaturan nomor WhatsApp — desktop */}
      <div className="mx-auto hidden max-w-md flex-1 items-center justify-center gap-2 md:flex">
        <Phone size={20} aria-hidden="true" className="text-secondary" />
        <label htmlFor="wa-desktop" className="sr-only">
          Nomor WhatsApp admin
        </label>
        <input
          id="wa-desktop"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 w-full rounded-input border border-border-subtle bg-surface-input px-4 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {/* TODO: simpan ke Supabase (PRD §5.B.3) */}
        <Button type="button" className="h-10 whitespace-nowrap">
          Simpan
        </Button>
      </div>

      <form action={logout}>
        <button
          type="submit"
          aria-label="Keluar"
          className="inline-flex items-center gap-2 rounded-btn border border-border-subtle px-3 py-2 font-label-md text-label-md text-secondary transition-colors hover:text-primary"
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </form>
    </header>
  );
}
