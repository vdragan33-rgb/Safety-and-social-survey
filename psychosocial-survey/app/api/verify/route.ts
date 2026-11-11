import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let email = "";
  let code = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
    code = String(body.code ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!email || !/^[0-9]{6,8}$/.test(code)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { error } = await createClient().auth.verifyOtp({ email, token: code, type: "email" });
  if (error) return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
