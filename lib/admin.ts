import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function getAdminClient(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) return null;
  return { supabase, user };
}
