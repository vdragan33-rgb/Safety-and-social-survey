import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SURVEY_YEAR } from "@/lib/config";
import Header from "@/components/Header";
import Results from "@/components/Results";
import type { Row } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "admin") redirect("/survey");

  const db = createAdminClient();
  const [{ data }, invited, submitted] = await Promise.all([
    db
      .from("responses")
      .select("year, workplace, engagement, answers, comment_stress, comment_change")
      .order("year", { ascending: false }),
    db.from("allowed_emails").select("email", { count: "exact", head: true }).eq("role", "respondent"),
    db.from("submissions").select("user_id", { count: "exact", head: true }).eq("year", SURVEY_YEAR),
  ]);

  return (
    <div className="wrap">
      <Header session={session} current="results" />
      <Results
        rows={(data ?? []) as Row[]}
        year={SURVEY_YEAR}
        invited={invited.count ?? 0}
        submitted={submitted.count ?? 0}
      />
    </div>
  );
}
