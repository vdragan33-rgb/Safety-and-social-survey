import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SURVEY_YEAR } from "@/lib/config";
import Header from "@/components/Header";
import SurveyForm from "@/components/SurveyForm";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";

export default async function SurveyPage() {
  const session = await getSession();
  if (!session?.role) redirect("/");

  const { data } = await createAdminClient()
    .from("submissions")
    .select("year")
    .eq("year", SURVEY_YEAR)
    .eq("user_id", session.userId)
    .maybeSingle();

  return (
    <div className="wrap">
      <Header session={session} current="survey" />
      {data ? (
        <div className="done">
          <div className="msg ok">
            <strong>
              <T
                pt={`Já respondeu em ${SURVEY_YEAR}. Obrigado.`}
                en={`You have already responded in ${SURVEY_YEAR}. Thank you.`}
              />
            </strong>
            <br />
            <T pt="Cada pessoa responde uma vez por ano." en="Each person responds once a year." />
          </div>
        </div>
      ) : (
        <SurveyForm year={SURVEY_YEAR} />
      )}
    </div>
  );
}
