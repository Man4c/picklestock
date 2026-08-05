import { WHATSAPP_NUMBER } from "./constants";

export type WhatsAppActionState = {
  status: "idle" | "success" | "error";
  message: string;
  value?: string;
};

export const INITIAL_WHATSAPP_ACTION_STATE: WhatsAppActionState = {
  status: "idle",
  message: "",
};

/**
 * Mengubah format lokal Indonesia menjadi nomor internasional untuk wa.me.
 * Contoh: 0812… / 812… / +62 812… semuanya menjadi +62812…
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;

  if (digits.length < 10 || digits.length > 15 || digits.startsWith("00")) {
    return null;
  }

  return `+${digits}`;
}

export function safeWhatsAppNumber(value: unknown): string {
  return normalizeWhatsAppNumber(typeof value === "string" ? value : "") ??
    WHATSAPP_NUMBER;
}
