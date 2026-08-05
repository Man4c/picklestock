import { LogOut } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { WhatsAppSettingForm } from "@/components/admin/WhatsAppSettingForm";
import { logout } from "@/app/admin/actions";

export function AdminHeader({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <header className="z-30 border-b border-outline-variant bg-surface/95 backdrop-blur-md md:sticky md:top-0">
      <div className="flex h-16 items-center justify-between gap-3 pl-16 pr-margin-page lg:px-margin-page">
        <h1 className="shrink-0 font-display-logo text-display-logo tracking-tighter text-primary lg:hidden">
          {SITE_NAME} Admin
        </h1>

        <WhatsAppSettingForm initialPhone={whatsappNumber} variant="desktop" />

        <form action={logout} className="ml-auto shrink-0">
          <button
            type="submit"
            aria-label="Keluar"
            className="inline-flex items-center gap-2 rounded-btn border border-border-subtle bg-surface-pure px-3 py-2 font-label-md text-label-md text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </form>
      </div>

      <div className="px-margin-page pb-3 md:hidden">
        <WhatsAppSettingForm initialPhone={whatsappNumber} variant="mobile" />
      </div>
    </header>
  );
}
