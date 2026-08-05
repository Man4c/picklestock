import { describe, expect, it } from "vitest";
import {
  PRODUCT_IMAGE_RULES,
  validateProductImageSelection,
} from "./product-image-validation";

const image = (type: string, size = 1024) => ({ type, size });

describe("validateProductImageSelection", () => {
  it("menerima kombinasi gambar valid", () => {
    expect(
      validateProductImageSelection(1, [
        image("image/jpeg"),
        image("image/webp"),
      ]),
    ).toBeNull();
  });

  it("mewajibkan minimal satu gambar", () => {
    expect(validateProductImageSelection(0, [])).toContain("minimal satu");
  });

  it("membatasi jumlah gambar", () => {
    expect(
      validateProductImageSelection(4, [image("image/png")]),
    ).toContain("Maksimal 4");
  });

  it("menolak MIME type selain JPG, PNG, dan WebP", () => {
    expect(validateProductImageSelection(0, [image("image/svg+xml")])).toContain(
      "JPG, PNG, atau WebP",
    );
  });

  it("menolak file di atas 5 MB", () => {
    expect(
      validateProductImageSelection(0, [
        image("image/png", PRODUCT_IMAGE_RULES.maxSize + 1),
      ]),
    ).toContain("5 MB");
  });
});
