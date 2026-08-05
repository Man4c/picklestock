export const PRODUCT_IMAGE_RULES = {
  bucket: "product-images",
  maxCount: 4,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]),
} as const;

export function validateProductImageSelection(
  existingCount: number,
  files: Pick<File, "size" | "type">[],
): string | null {
  if (existingCount + files.length > PRODUCT_IMAGE_RULES.maxCount) {
    return `Maksimal ${PRODUCT_IMAGE_RULES.maxCount} gambar per produk.`;
  }
  if (existingCount + files.length === 0) {
    return "Tambahkan minimal satu gambar produk.";
  }
  if (files.some((file) => !PRODUCT_IMAGE_RULES.allowedTypes.has(file.type))) {
    return "Format gambar harus JPG, PNG, atau WebP.";
  }
  if (files.some((file) => file.size > PRODUCT_IMAGE_RULES.maxSize)) {
    return "Ukuran setiap gambar maksimal 5 MB.";
  }
  return null;
}
