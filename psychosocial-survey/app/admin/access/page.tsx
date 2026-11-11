import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Header from "@/components/Header";
import AccessManager from "@/components/AccessManager";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "admin") redirect("/survey");

  const { data } = await createAdminClient()
    .from("allowed_emails")
    .select("email, role")
    .order("email");

  return (
    <div className="wrap">
      <Header session={session} current="access" />
      <AccessManager initial={(data ?? []) as { email: string; role: "respondent" | "admin" }[]} me={session.email} />
    </div>
  );
}
