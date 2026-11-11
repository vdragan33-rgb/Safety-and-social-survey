"use client";

import { useMemo, useState } from "react";
import { T } from "./T";
import { DIMS, SC, CTX_LOCAL, CTX_VINC } from "@/lib/survey-data";

export default function SurveyForm({ year }: { year: number }) {
  const [workplace, setWorkplace] = useState("");
  const [engagement, setEngagement] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"" | "done" | "already" | "error" | "incomplete">("");

  const fieldwork = workplace === "terreno" || workplace === "ambos";
  const required = useMemo(
    () =>
      DIMS.filter((d) => !d.field || fieldwork).flatMap((d) => d.items.map((i) => i[0])),
    [fieldwork]
  );
  const answered = required.filter((id) => answers[id] !== undefined).length;
  const total = required.length + 1;
  const done = answered + (workplace ? 1 : 0);
  const pct = Math.round((done / total) * 100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const miss: string[] = [];
    if (!workplace) miss.push("q-local");
    required.forEach((id) => {
      if (answers[id] === undefined) miss.push("q-" + id);
    });
    setMissing(miss);
    setState("");
    if (miss.length) {
      setState("incomplete");
      document.getElementById(miss[0])?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workplace,
          engagement: engagement || "nd",
          answers: Object.fromEntries(required.map((id) => [id, answers[id]])),
          commentStress: c1,
          commentChange: c2,
        }),
      });
      if (res.ok) setState("done");
      else if (res.status === 409) setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
    setBusy(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (state === "done" || state === "already") {
    return (
      <div className="done">
        <div className="msg ok">
          {state === "done" ? (
            <>
              <strong>
                <T pt="Resposta registada. Obrigado." en="Response recorded. Thank you." />
              </strong>
              <br />
              <T
                pt="A sua resposta foi guardada sem qualquer dado que o identifique."
                en="Your response was saved without any data that identifies you."
              />
            </>
          ) : (
            <strong>
              <T
                pt={`Já respondeu em ${year}. Obrigado.`}
                en={`You have already responded in ${year}. Thank you.`}
              />
            </strong>
          )}
        </div>
        <p className="note">
          <T
            pt="Se precisar de apoio, fale com a gerência, com o médico do trabalho ou com o serviço externo de SST da empresa."
            en="If you need support, speak to management, the occupational physician or the company's external health and safety service."
          />
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="intro">
        <div className="panel" style={{ display: "grid", gap: 14 }}>
          <p>
            <T
              pt="Este inquérito faz parte da avaliação anual dos riscos profissionais da empresa. Destina-se a quem trabalha connosco no escritório e no terreno: colaboradores, prestadores externos e trabalhadores independentes. Pergunta como o trabalho é organizado e como o vive, para que a empresa possa corrigir o que estiver a prejudicar a saúde de quem trabalha."
              en="This survey is part of the company's annual occupational risk assessment. It is for everyone who works with us, in the office or in the field: employees, external providers and freelancers. It asks how work is organised and how you experience it, so the company can fix what is harming people's health."
            />
          </p>
          <div className="facts">
            <div>
              <b><T pt="Cerca de 12 minutos" en="About 12 minutes" /></b>
              <span className="d"><T pt="Pode responder no telemóvel ou no computador." en="You can answer on a phone or a computer." /></span>
            </div>
            <div>
              <b><T pt="Anónimo" en="Anonymous" /></b>
              <span className="d"><T pt="As respostas não ficam ligadas ao seu nome ou email, e não guardamos data nem hora." en="Answers are not linked to your name or email, and we do not store the date or time." /></span>
            </div>
            <div>
              <b><T pt="Resultados agrupados" en="Grouped results" /></b>
              <span className="d"><T pt="Só são apresentados resultados de grupos com 5 ou mais respostas." en="Results are only shown for groups of 5 or more responses." /></span>
            </div>
          </div>
          <ul>
            <li><T pt={<>Responda pensando nos <strong>últimos 12 meses</strong>.</>} en={<>Answer thinking about the <strong>last 12 months</strong>.</>} /></li>
            <li><T pt="Não há respostas certas ou erradas. O que interessa é a sua experiência." en="There are no right or wrong answers. Your own experience is what counts." /></li>
            <li><T pt="Não escreva nos comentários nomes de pessoas nem detalhes que o identifiquem." en="Do not write people's names or details that could identify you in the comments." /></li>
            <li><T pt="Se está a viver uma situação de assédio ou violência neste momento, não espere pelo resultado do inquérito: use o canal de denúncia da empresa ou fale com a gerência." en="If you are experiencing harassment or violence right now, do not wait for the survey results: use the company's reporting channel or speak to management." /></li>
          </ul>
          <p className="small">
            <T
              pt="Enquadramento: o empregador deve avaliar os riscos profissionais, onde se incluem os psicossociais, e consultar os trabalhadores sobre a prevenção (Lei n.º 102/2009, de 10 de setembro, e artigos 281.º e seguintes do Código do Trabalho). O assédio é tratado no artigo 29.º do Código do Trabalho. Os dados são tratados de forma agregada, em conformidade com o RGPD."
              en="Legal background: the employer must assess occupational risks, including psychosocial ones, and consult workers on prevention (Law no. 102/2009 of 10 September, and articles 281 onwards of the Portuguese Labour Code). Harassment is addressed in article 29 of the Labour Code. Data are processed in aggregated form, in line with the GDPR."
            />
          </p>
        </div>
      </div>

      <div className="progress" aria-live="polite">
        <div className="row">
          <span>
            <T
              pt={`${done} de ${total} perguntas respondidas`}
              en={`${done} of ${total} questions answered`}
            />
          </span>
          <span>{pct}%</span>
        </div>
        <div className="bar"><i style={{ width: pct + "%" }} /></div>
      </div>

      <form onSubmit={submit} noValidate autoComplete="off">
        <section className="dim">
          <div className="head">
            <div className="eyebrow"><T pt="Sobre o seu trabalho" en="About your work" /></div>
            <h2><T pt="Onde trabalha?" en="Where do you work?" /></h2>
            <p className="hint">
              <T
                pt="Serve só para agrupar resultados. Se o seu grupo tiver menos de 5 respostas, os dados não são apresentados em separado. O vínculo é opcional."
                en="Used only to group results. If your group has fewer than 5 responses, its data are not shown separately. Type of engagement is optional."
              />
            </p>
          </div>
          <div className={"item" + (missing.includes("q-local") ? " missing" : "")} id="q-local">
            <div className="field">
              <span className="t" id="lbl-local"><T pt="Local de trabalho habitual" en="Usual place of work" /></span>
              <div className="choices" role="radiogroup" aria-labelledby="lbl-local">
                {CTX_LOCAL.map((o) => (
                  <label key={o[0]}>
                    <input type="radio" name="local" value={o[0]} checked={workplace === o[0]} onChange={() => setWorkplace(o[0])} />
                    <span><T pt={o[1]} en={o[2]} /></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="item">
            <div className="field">
              <span className="t" id="lbl-vinc"><T pt="Tipo de vínculo (opcional)" en="Type of engagement (optional)" /></span>
              <div className="choices" role="radiogroup" aria-labelledby="lbl-vinc">
                {CTX_VINC.map((o) => (
                  <label key={o[0]}>
                    <input type="radio" name="vinc" value={o[0]} checked={engagement === o[0]} onChange={() => setEngagement(o[0])} />
                    <span><T pt={o[1]} en={o[2]} /></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {DIMS.filter((d) => !d.field || fieldwork).map((d) => {
          const scale = SC[d.sc];
          const base = scale.base ?? 1;
          const n = d.items.length;
          return (
            <section className="dim" key={d.id}>
              <div className="head">
                <div className="eyebrow">
                  <T pt={`${n} ${n > 1 ? "perguntas" : "pergunta"}`} en={`${n} ${n > 1 ? "questions" : "question"}`} />
                </div>
                <h2><T pt={d.t[0]} en={d.t[1]} /></h2>
                {d.h[0] && <p className="hint"><T pt={d.h[0]} en={d.h[1]} /></p>}
              </div>
              <div className="legend mobile">
                {scale.labels.map((l, i) => (
                  <span className="lg" key={i}>
                    <T pt={`${base + i} = ${l[0]}`} en={`${base + i} = ${l[1]}`} />
                  </span>
                ))}
              </div>
              {d.items.map((it) => (
                <fieldset
                  className={"item" + (missing.includes("q-" + it[0]) ? " missing" : "")}
                  id={"q-" + it[0]}
                  key={it[0]}
                >
                  <legend><T pt={it[1]} en={it[2]} /></legend>
                  <div className="opts" style={{ ["--n" as any]: scale.n }}>
                    {scale.labels.map((l, i) => {
                      const v = base + i;
                      return (
                        <label key={v}>
                          <input
                            type="radio"
                            name={it[0]}
                            value={v}
                            checked={answers[it[0]] === v}
                            onChange={() => setAnswers((a) => ({ ...a, [it[0]]: v }))}
                          />
                          <span>
                            <b>{v}</b>
                            <em><T pt={l[0]} en={l[1]} /></em>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </section>
          );
        })}

        <section className="dim">
          <div className="head">
            <div className="eyebrow"><T pt="Opcional" en="Optional" /></div>
            <h2><T pt="Comentários" en="Comments" /></h2>
            <p className="hint">
              <T
                pt="Não escreva nomes de pessoas nem detalhes que o identifiquem. Os comentários são lidos por quem trata os resultados."
                en="Do not write people's names or details that could identify you. Comments are read by the people who process the results."
              />
            </p>
          </div>
          <div className="item">
            <div className="field">
              <label className="t" htmlFor="c-stress"><T pt="O que mais pesa no seu trabalho neste momento?" en="What weighs on you most at work right now?" /></label>
              <textarea id="c-stress" maxLength={800} value={c1} onChange={(e) => setC1(e.target.value)} />
              <div className="counter">{c1.length} / 800</div>
            </div>
          </div>
          <div className="item">
            <div className="field">
              <label className="t" htmlFor="c-melhor"><T pt="O que mudaria primeiro para melhorar as condições de trabalho?" en="What would you change first to improve working conditions?" /></label>
              <textarea id="c-melhor" maxLength={800} value={c2} onChange={(e) => setC2(e.target.value)} />
              <div className="counter">{c2.length} / 800</div>
            </div>
          </div>
        </section>

        <div role="alert" style={{ marginTop: 18 }}>
          {state === "incomplete" && (
            <div className="msg err">
              <T
                pt={`Faltam ${missing.length} respostas. As perguntas por responder estão assinaladas a vermelho.`}
                en={`${missing.length} answers are missing. Unanswered questions are marked in red.`}
              />
            </div>
          )}
          {state === "error" && (
            <div className="msg err">
              <T pt="Não foi possível guardar a resposta. Tente novamente dentro de instantes." en="Could not save the response. Please try again in a moment." />
            </div>
          )}
        </div>
        <div className="actions">
          <button className="btn" type="submit" disabled={busy}>
            <T pt="Submeter resposta anónima" en="Submit anonymous response" />
          </button>
        </div>
      </form>
    </>
  );
}
