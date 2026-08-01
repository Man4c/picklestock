import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase untuk server components / server actions. Memakai pola
 * @supabase/ssr sejak awal (walau baca-saja belum butuh cookie) agar tak perlu
 * refactor saat auth masuk di sub-proyek #2.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component tak boleh menulis cookie — aman diabaikan saat
            // baca; middleware auth (#2) yang akan menyegarkan sesi.
          }
        },
      },
    },
  );
}
