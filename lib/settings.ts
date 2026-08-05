import { WHATSAPP_NUMBER } from "./constants";
import { safeWhatsAppNumber } from "./whatsapp";
import { createClient } from "./supabase/server";

export const WHATSAPP_SETTING_KEY = "whatsapp_number";

export async function getWhatsAppNumber(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", WHATSAPP_SETTING_KEY)
    .maybeSingle();

  if (error) {
    console.error("[getWhatsAppNumber] gagal memuat pengaturan:", error.message);
    return WHATSAPP_NUMBER;
  }

  return safeWhatsAppNumber(data?.value);
}
