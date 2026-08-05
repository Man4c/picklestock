import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUSES,
  type Order,
  type OrderPage,
  type OrderStatus,
} from "@/lib/order-types";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  notes: string;
  order_date: string;
  created_at: string;
  updated_at: string;
};

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalAmount: row.total_amount,
    status: row.status,
    notes: row.notes,
    orderDate: row.order_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeSearch(value: string): string {
  return value.trim().slice(0, 80).replace(/[%_,()]/g, " ").replace(/\s+/g, " ");
}

export function parseOrderStatus(value: string | undefined): OrderStatus | "all" {
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : "all";
}

export async function getOrdersPage({
  page = 1,
  pageSize,
  query = "",
  status = "all",
}: {
  page?: number;
  pageSize: number;
  query?: string;
  status?: OrderStatus | "all";
}): Promise<OrderPage> {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const search = normalizeSearch(query);
  const start = (safePage - 1) * safePageSize;
  const supabase = await createClient();
  let request = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, start + safePageSize - 1);

  if (status !== "all") request = request.eq("status", status);
  if (search) {
    const pattern = `%${search}%`;
    request = request.or(
      `order_number.ilike.${pattern},customer_name.ilike.${pattern},customer_phone.ilike.${pattern},product_name.ilike.${pattern}`,
    );
  }

  const { data, error, count } = await request;
  if (error) {
    console.error("[getOrdersPage] gagal memuat pesanan:", error.message);
    return {
      orders: [],
      page: safePage,
      pageSize: safePageSize,
      total: 0,
      totalPages: 0,
      query: search,
      status,
    };
  }

  const total = count ?? 0;
  return {
    orders: (data ?? []).map((row) => rowToOrder(row as OrderRow)),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / safePageSize),
    query: search,
    status,
  };
}

export async function getOrderProductOptions(): Promise<
  Array<{ id: string; name: string; price: number }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price")
    .order("name");
  if (error) {
    console.error("[getOrderProductOptions] gagal:", error.message);
    return [];
  }
  return data ?? [];
}
