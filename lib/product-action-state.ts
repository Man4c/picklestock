export type ProductActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_PRODUCT_ACTION_STATE: ProductActionState = {
  status: "idle",
  message: "",
};
