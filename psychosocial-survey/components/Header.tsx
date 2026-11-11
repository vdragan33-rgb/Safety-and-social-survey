import { cookies } from "next/headers";
import Link from "next/link";
import LangSwitch from "./LangSwitch";
import { T } from "./T";
import type { Session } from "@/lib/auth";
import type { Lang } from "@/lib/constants";

export default function Header({
  session,
  current,
}: {
  session: Session | null;
  current?: "survey" | "results" | "access";
}) {
  const lang: Lang = cookies().get("lang")?.value === "en" ? "en" : "pt";
  const isAdmin = session?.role === "admin";
  return (
    <header className="top">
      <div className="toprow">
        <div className="eyebrow">
          <T
            pt="Avaliação anual · Segurança e Saúde no Trabalho"
            en="Annual assessment · Occupational Health and Safety"
          />
        </div>
        <LangSwitch initial={lang} />
      </div>
      <h1>
        <T
          pt="Inquérito de Riscos Psicossociais e Organizacionais"
          en="Psychosocial and Organisational Risk Survey"
        />
      </h1>
      {session && (
        <nav className="tabs" aria-label="Menu">
          {session.role && (
            <Link href="/survey" aria-current={current === "survey" ? "page" : undefined}>
              <T pt="Inquérito" en="Survey" />
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" aria-current={current === "results" ? "page" : undefined}>
              <T pt="Resultados" en="Results" />
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/access"
              aria-current={current === "access" ? "page" : undefined}
            >
              <T pt="Acessos" en="Access" />
            </Link>
          )}
          <form action="/auth/signout" method="post" style={{ marginLeft: "auto" }}>
            <span className="rolepill">{session.email} </span>
            <button className="signout" type="submit">
              <T pt="Terminar sessão" en="Sign out" />
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
