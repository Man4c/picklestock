import { LogOut } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { WhatsAppSettingForm } from "@/components/admin/WhatsAppSettingForm";
import { logout } from "@/app/admin/actions";

export function AdminHeader({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-margin-page backdrop-blur-md">
      <h1 className="font-display-logo text-display-logo tracking-tighter text-primary">
        {SITE_NAME} Admin
      </h1>

      <WhatsAppSettingForm initialPhone={whatsappNumber} variant="desktop" />

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
