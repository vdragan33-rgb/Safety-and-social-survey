import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { SURVEY_YEAR } from "@/lib/config";
import { DIMS, CTX_LOCAL, CTX_VINC, SC } from "@/lib/survey-data";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.role) return NextResponse.json({ error: "not_allowed" }, { status: 403 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const workplace = String(body.workplace ?? "");
  const engagement = String(body.engagement ?? "nd");
  if (!CTX_LOCAL.some((o) => o[0] === workplace)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!CTX_VINC.some((o) => o[0] === engagement)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Validate every answer against the survey definition. Unknown ids are dropped.
  const fieldwork = workplace === "terreno" || workplace === "ambos";
  const raw = (body.answers ?? {}) as Record<string, unknown>;
  const answers: Record<string, number> = {};
  for (const d of DIMS) {
    if (d.field && !fieldwork) continue;
    const scale = SC[d.sc];
    const base = scale.base ?? 1;
    for (const it of d.items) {
      const v = raw[it[0]];
      if (
        typeof v !== "number" ||
        !Number.isInteger(v) ||
        v < base ||
        v > base + scale.n - 1
      ) {
        return NextResponse.json({ error: "incomplete", item: it[0] }, { status: 422 });
      }
      answers[it[0]] = v;
    }
  }

  const { error } = await createClient().rpc("submit_response", {
    p_year: SURVEY_YEAR,
    p_workplace: workplace,
    p_engagement: engagement,
    p_answers: answers,
    p_comment_stress: String(body.commentStress ?? "").slice(0, 800),
    p_comment_change: String(body.commentChange ?? "").slice(0, 800),
  });

  if (error) {
    if (error.message?.includes("already_submitted")) {
      return NextResponse.json({ error: "already_submitted" }, { status: 409 });
    }
    if (error.message?.includes("not_allowed")) {
      return NextResponse.json({ error: "not_allowed" }, { status: 403 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
