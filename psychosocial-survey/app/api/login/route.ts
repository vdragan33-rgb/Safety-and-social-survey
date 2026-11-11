import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sends a one-time code, but only to emails on the allowlist. The response is the same
 * whether or not the email is allowed, so the form cannot be used to discover who is invited.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { data } = await createAdminClient()
    .from("allowed_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (data) {
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true });
}
