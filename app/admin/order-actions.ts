"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/admin";
import {
  ORDER_STATUSES,
  type OrderActionState,
  type OrderStatus,
} from "@/lib/order-types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

function errorState(message: string): OrderActionState {
  return { status: "error", message };
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function positiveInteger(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 100_000
    ? parsed
    : null;
}

function nonNegativeInteger(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 2_147_483_647
    ? parsed
    : null;
}

function isStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

function revalidateOrders() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function saveOrder(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const admin = await getAdminClient();
  if (!admin) return errorState("Sesi admin berakhir. Silakan masuk kembali.");
  const { supabase, user } = admin;

  const orderId = text(formData, "orderId");
  const customerName = text(formData, "customerName");
  const customerPhone = normalizeWhatsAppNumber(text(formData, "customerPhone"));
  const productId = text(formData, "productId") || null;
  let productName = text(formData, "productName");
  const quantity = positiveInteger(text(formData, "quantity"));
  const unitPrice = nonNegativeInteger(text(formData, "unitPrice"));
  const status = text(formData, "status");
  const orderDate = text(formData, "orderDate");
  const notes = text(formData, "notes");

  if (!customerName || !customerPhone || !productName || !quantity || unitPrice === null) {
    return errorState("Lengkapi pelanggan, nomor WhatsApp, produk, jumlah, dan harga.");
  }
  if (!isStatus(status)) return errorState("Status pesanan tidak valid.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) {
    return errorState("Tanggal pesanan tidak valid.");
  }
  if (
    customerName.length > 120 ||
    productName.length > 160 ||
    notes.length > 1000
  ) {
    return errorState("Salah satu isian pesanan terlalu panjang.");
  }

  if (productId) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .maybeSingle();
    if (productError || !product) {
      return errorState("Produk tidak ditemukan. Muat ulang lalu pilih produk lagi.");
    }
    productName = product.name;
  }

  const payload = {
    customer_name: customerName,
    customer_phone: customerPhone,
    product_id: productId,
    product_name: productName,
    quantity,
    unit_price: unitPrice,
    status,
    order_date: orderDate,
    notes,
    updated_at: new Date().toISOString(),
  };

  const mutation = orderId
    ? await supabase.from("orders").update(payload).eq("id", orderId)
    : await supabase.from("orders").insert({
        ...payload,
        order_number: `PS-${orderDate.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
        created_by: user.id,
      });

  if (mutation.error) {
    console.error("[saveOrder] gagal:", mutation.error.message);
    return errorState("Pesanan gagal disimpan. Coba lagi.");
  }

  revalidateOrders();
  return {
    status: "success",
    message: orderId ? "Perubahan pesanan tersimpan." : "Pesanan berhasil dicatat.",
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<OrderActionState> {
  const admin = await getAdminClient();
  if (!admin) return errorState("Sesi admin berakhir. Silakan masuk kembali.");
  if (!orderId || !isStatus(status)) return errorState("Status pesanan tidak valid.");

  const { error } = await admin.supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) {
    console.error("[updateOrderStatus] gagal:", error.message);
    return errorState("Status pesanan gagal diperbarui.");
  }
  revalidateOrders();
  return { status: "success", message: "Status pesanan diperbarui." };
}

export async function deleteOrder(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const admin = await getAdminClient();
  if (!admin) return errorState("Sesi admin berakhir. Silakan masuk kembali.");
  const orderId = text(formData, "orderId");
  if (!orderId) return errorState("Pesanan tidak valid.");

  const { error } = await admin.supabase.from("orders").delete().eq("id", orderId);
  if (error) {
    console.error("[deleteOrder] gagal:", error.message);
    return errorState("Pesanan gagal dihapus.");
  }
  revalidateOrders();
  return { status: "success", message: "Catatan pesanan dihapus." };
}
