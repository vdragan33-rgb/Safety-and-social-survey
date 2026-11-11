import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");
  if (session?.role === "respondent") redirect("/survey");

  return (
    <div className="wrap">
      <Header session={session} />
      <div className="card-narrow panel">
        {session && !session.role ? (
          <div className="msg warn">
            <T
              pt={`O email ${session.email} não está na lista de acesso a este inquérito. Peça à gerência para o adicionar.`}
              en={`The email ${session.email} is not on this survey's access list. Ask management to add it.`}
            />
            <form action="/auth/signout" method="post" style={{ marginTop: 10 }}>
              <button className="btn ghost small" type="submit">
                <T pt="Usar outro email" en="Use another email" />
              </button>
            </form>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
