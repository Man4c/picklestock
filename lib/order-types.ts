export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "paid",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Baru",
  confirmed: "Dikonfirmasi",
  paid: "Dibayar",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  notes: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderPage = {
  orders: Order[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  query: string;
  status: OrderStatus | "all";
};

export type OrderActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_ORDER_ACTION_STATE: OrderActionState = {
  status: "idle",
  message: "",
};
