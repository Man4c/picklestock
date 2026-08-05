import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "./admin";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const createClientMock = vi.mocked(createClient);

function client(options: { user: { id: string } | null; membership: object | null }) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.membership,
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user },
        error: null,
      }),
    },
    from,
  };
}

describe("getAdminClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menolak pengunjung tanpa sesi", async () => {
    const supabase = client({ user: null, membership: null });
    createClientMock.mockResolvedValue(supabase as never);

    expect(await getAdminClient()).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("menolak user terautentikasi yang bukan admin", async () => {
    const supabase = client({ user: { id: "user-1" }, membership: null });
    createClientMock.mockResolvedValue(supabase as never);

    expect(await getAdminClient()).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith("admin_users");
  });

  it("mengembalikan client hanya untuk anggota admin_users", async () => {
    const user = { id: "admin-1" };
    const supabase = client({ user, membership: { user_id: user.id } });
    createClientMock.mockResolvedValue(supabase as never);

    const result = await getAdminClient();
    expect(result?.supabase).toBe(supabase);
    expect(result?.user).toBe(user);
  });
});
