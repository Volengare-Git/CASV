import { createClient } from "./server";
import { createAdminClient } from "./admin";

export async function assertAdmin() {
  // 1. Verify the JWT via the session-bound client (cannot be forged)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. Read the role via the service-role client (bypasses RLS entirely).
  //    This prevents privilege escalation through a misconfigured RLS policy
  //    that would allow a user to update their own `role` column.
  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return adminDb;
}
