import { describe, expect, it } from "vitest";
import { normalizeWhatsAppNumber, safeWhatsAppNumber } from "./whatsapp";
import { WHATSAPP_NUMBER } from "./constants";

describe("normalizeWhatsAppNumber", () => {
  it.each([
    ["0812-3456-7890", "+6281234567890"],
    ["812 3456 7890", "+6281234567890"],
    ["+62 812-3456-7890", "+6281234567890"],
  ])("menormalkan %s", (input, expected) => {
    expect(normalizeWhatsAppNumber(input)).toBe(expected);
  });

  it.each(["", "123", "+62 123", "1234567890123456"])(
    "menolak nomor tidak valid: %s",
    (input) => expect(normalizeWhatsAppNumber(input)).toBeNull(),
  );

  it("menggunakan fallback saat nilai database rusak", () => {
    expect(safeWhatsAppNumber(null)).toBe(WHATSAPP_NUMBER);
  });
});
