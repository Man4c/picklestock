"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/admin";
import { WHATSAPP_SETTING_KEY } from "@/lib/settings";
import {
  normalizeWhatsAppNumber,
  type WhatsAppActionState,
} from "@/lib/whatsapp";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] gagal:", error.message);
    // Pesan generik — jangan bedakan email vs password salah.
    if (error.message.toLowerCase().includes("invalid")) {
      return { error: "Email atau kata sandi salah." };
    }
    return { error: "Gagal terhubung. Coba lagi." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    await supabase.auth.signOut();
    console.error("[login] akun bukan admin");
    return { error: "Email atau kata sandi salah." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateWhatsAppNumber(
  _previousState: WhatsAppActionState,
  formData: FormData,
): Promise<WhatsAppActionState> {
  const admin = await getAdminClient();
  if (!admin) {
    return { status: "error", message: "Sesi admin berakhir. Silakan masuk kembali." };
  }
  const { supabase, user } = admin;

  const phone = normalizeWhatsAppNumber(String(formData.get("phone") ?? ""));
  if (!phone) {
    return {
      status: "error",
      message: "Masukkan nomor WhatsApp aktif dengan 10–15 digit.",
    };
  }

  const { error } = await supabase.from("site_settings").upsert({
    key: WHATSAPP_SETTING_KEY,
    value: phone,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });

  if (error) {
    console.error("[updateWhatsAppNumber] gagal:", error.message);
    return { status: "error", message: "Nomor WhatsApp gagal disimpan." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/produk/[slug]", "page");
  return { status: "success", message: "Nomor WhatsApp tersimpan.", value: phone };
}
