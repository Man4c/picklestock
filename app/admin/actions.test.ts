import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/admin";
import { INITIAL_WHATSAPP_ACTION_STATE } from "@/lib/whatsapp";
import { updateWhatsAppNumber } from "./actions";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/admin", () => ({ getAdminClient: vi.fn() }));

const getAdminClientMock = vi.mocked(getAdminClient);
const revalidatePathMock = vi.mocked(revalidatePath);

function form(phone: string) {
  const data = new FormData();
  data.set("phone", phone);
  return data;
}

function client(options?: { upsertError?: object | null }) {
  const upsert = vi.fn().mockResolvedValue({ error: options?.upsertError ?? null });
  const from = vi.fn().mockReturnValue({ upsert });
  return {
    from,
    upsert,
  };
}

describe("updateWhatsAppNumber", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menolak sesi tanpa admin", async () => {
    const supabase = client();
    getAdminClientMock.mockResolvedValue(null);

    const result = await updateWhatsAppNumber(
      INITIAL_WHATSAPP_ACTION_STATE,
      form("081234567890"),
    );

    expect(result.status).toBe("error");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("menolak nomor yang tidak valid", async () => {
    const supabase = client();
    getAdminClientMock.mockResolvedValue({
      supabase: supabase as never,
      user: { id: "admin-1" } as never,
    });

    const result = await updateWhatsAppNumber(
      INITIAL_WHATSAPP_ACTION_STATE,
      form("123"),
    );

    expect(result.status).toBe("error");
    expect(supabase.upsert).not.toHaveBeenCalled();
  });

  it("menyimpan nomor ter-normalisasi dan merevalidasi semua halaman", async () => {
    const supabase = client();
    getAdminClientMock.mockResolvedValue({
      supabase: supabase as never,
      user: { id: "admin-1" } as never,
    });

    const result = await updateWhatsAppNumber(
      INITIAL_WHATSAPP_ACTION_STATE,
      form("0812-3456-7890"),
    );

    expect(result).toMatchObject({ status: "success", value: "+6281234567890" });
    expect(supabase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "whatsapp_number",
        value: "+6281234567890",
        updated_by: "admin-1",
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin", "layout");
    expect(revalidatePathMock).toHaveBeenCalledWith("/produk/[slug]", "page");
  });
});
