import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export type Role = "respondent" | "admin";
export type Session = { userId: string; email: string; role: Role | null };

/**
 * Returns the signed-in user and their role from the allowlist.
 * role is null when the person is signed in but not on the allowlist.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const email = user.email.toLowerCase();
  const { data } = await createAdminClient()
    .from("allowed_emails")
    .select("role")
    .eq("email", email)
    .maybeSingle();
  return { userId: user.id, email, role: (data?.role as Role) ?? null };
}
