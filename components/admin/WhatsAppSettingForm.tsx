"use client";

import { useActionState } from "react";
import { updateWhatsAppNumber } from "@/app/admin/actions";
import {
  INITIAL_WHATSAPP_ACTION_STATE,
  type WhatsAppActionState,
} from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

type Props = {
  initialPhone: string;
  variant: "desktop" | "mobile";
};

export function WhatsAppSettingForm({ initialPhone, variant }: Props) {
  const [state, formAction, pending] = useActionState<
    WhatsAppActionState,
    FormData
  >(updateWhatsAppNumber, INITIAL_WHATSAPP_ACTION_STATE);

  const mobile = variant === "mobile";
  const inputId = mobile ? "wa-mobile" : "wa-desktop";
  const messageId = `${inputId}-message`;

  return (
    <form
      action={formAction}
      className={
        mobile
          ? "flex flex-col gap-2 rounded-card border border-border-subtle bg-surface-pure p-padding-card shadow-soft md:hidden"
          : "mx-auto hidden min-w-0 max-w-md flex-1 items-center justify-center gap-2 md:flex"
      }
    >
      <label
        htmlFor={inputId}
        className={
          mobile
            ? "flex items-center gap-2 font-label-md text-label-md text-on-surface"
            : "sr-only"
        }
      >
        {mobile && <WhatsAppIcon size={16} className="text-secondary" />}
        Nomor WhatsApp admin
      </label>

      {!mobile && <WhatsAppIcon size={20} className="shrink-0 text-secondary" />}

      <div className={mobile ? "flex min-w-0 flex-col gap-2 sm:flex-row" : "contents"}>
        <input
          id={inputId}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={initialPhone}
          aria-invalid={state.status === "error"}
          aria-describedby={state.message ? messageId : undefined}
          disabled={pending}
          className="h-10 min-w-0 w-full rounded-input border border-border-subtle bg-surface-input px-4 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 sm:flex-1"
        />
        <Button
          type="submit"
          disabled={pending}
          className={mobile ? "h-10 w-full sm:w-auto" : "h-10 shrink-0 whitespace-nowrap"}
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>

      {state.message && (
        <p
          id={messageId}
          role={state.status === "error" ? "alert" : "status"}
          className={`${mobile ? "" : "sr-only"} font-body-sm text-body-sm ${
            state.status === "error" ? "text-error" : "text-secondary"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
