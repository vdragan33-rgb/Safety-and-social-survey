import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function guard() {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

/** Add emails (or change roles). Body: { emails: string[], role: "respondent" | "admin" } */
export async function POST(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const role = body.role === "admin" ? "admin" : "respondent";
  const emails: string[] = Array.from(
    new Set(
      (Array.isArray(body.emails) ? body.emails : [])
        .map((e: unknown) => String(e).trim().toLowerCase())
        .filter((e: string) => EMAIL.test(e) && e.length <= 254)
    )
  );
  if (!emails.length || emails.length > 500) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { error } = await createAdminClient()
    .from("allowed_emails")
    .upsert(emails.map((email) => ({ email, role })), { onConflict: "email" });
  if (error) return NextResponse.json({ error: "server_error" }, { status: 500 });
  return NextResponse.json({ ok: true, count: emails.length });
}

/** Remove an email. Body: { email }. Admins cannot remove themselves. */
export async function DELETE(request: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let email = "";
  try {
    email = String((await request.json()).email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (email === session.email) return NextResponse.json({ error: "self" }, { status: 409 });
  const { error } = await createAdminClient().from("allowed_emails").delete().eq("email", email);
  if (error) return NextResponse.json({ error: "server_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
