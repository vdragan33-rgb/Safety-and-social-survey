import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { MIN_GROUP } from "@/lib/constants";
import { buildSummary, type Row } from "@/lib/scoring";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const year = Number(body.year);
  const local = String(body.local ?? "");
  const vinc = String(body.vinc ?? "");
  const lang = body.lang === "en" ? "English" : "European Portuguese (Portugal)";
  if (!Number.isInteger(year)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  let q = createAdminClient()
    .from("responses")
    .select("year, workplace, engagement, answers, comment_stress, comment_change")
    .eq("year", year);
  if (local) q = q.eq("workplace", local);
  if (vinc) q = q.eq("engagement", vinc);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const rows = (data ?? []) as Row[];
  if (rows.length < MIN_GROUP) return NextResponse.json({ error: "too_few" }, { status: 422 });

  const prompt =
    "You are helping the management of a small Portuguese company read the results of its annual psychosocial and organisational risk survey (office staff plus field inspectors who are employees, external providers or freelancers). Use only the data below. Respond in " +
    lang +
    ".\n\nWrite these sections with '## ' headings: Summary (3 sentences); Main risks (ranked, each with the figure behind it); Strengths; Themes in the comments (group them, never quote anything that could identify a person); Suggested actions (each with priority, suggested timeframe and a suggested owner role); Cautions (what the data cannot show, small sample limits, and that findings should be validated with the occupational health and safety service or an occupational psychologist). If harassment or violence figures are above zero, say so plainly and recommend reviewing the reporting channel and code of conduct. Do not diagnose individuals and do not invent data. Keep it under 500 words.\n\nDATA:\n" +
    buildSummary(rows, { year: String(year), local, vinc });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  const j = await res.json();
  const text = (j.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  return NextResponse.json({ text });
}
