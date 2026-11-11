"use client";

import { useMemo, useState } from "react";
import { T } from "./T";
import { useLang } from "@/lib/useLang";
import { MIN_GROUP } from "@/lib/constants";
import { DIMS, CTX_LOCAL, CTX_VINC, SC } from "@/lib/survey-data";
import { dimScore, level, findDim, LEVEL_LABELS, type Row } from "@/lib/scoring";

type Filters = { year: string; local: string; vinc: string };

export default function Results({
  rows,
  year,
  invited,
  submitted,
}: {
  rows: Row[];
  year: number;
  invited: number;
  submitted: number;
}) {
  const lang = useLang();
  const tx = (pt: string, en: string) => (lang === "pt" ? pt : en);

  const years = useMemo(() => {
    const s = new Set<number>(rows.map((r) => r.year));
    s.add(year);
    return Array.from(s).sort((a, b) => b - a);
  }, [rows, year]);

  const [f, setF] = useState<Filters>({ year: String(year), local: "", vinc: "" });
  const [ai, setAi] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState("");
  const [note, setNote] = useState("");

  const inYear = rows.filter((r) => String(r.year) === f.year);
  const sel = inYear.filter(
    (r) => (!f.local || r.workplace === f.local) && (!f.vinc || r.engagement === f.vinc)
  );
  const n = sel.length;
  const enough = n >= MIN_GROUP;

  function change(next: Partial<Filters>) {
    setF({ ...f, ...next });
    setAi("");
    setAiErr("");
  }

  const ad = findDim("assed");
  const cd = findDim("canal");

  const dimRows = DIMS.filter((d) => d.id !== "assed" && d.id !== "canal").map((d) => {
    const sc: number[] = [];
    sel.forEach((r) => {
      const s = dimScore(d, r.answers || {});
      if (s !== null) sc.push(s);
    });
    const avg = sc.length >= MIN_GROUP ? sc.reduce((a, b) => a + b, 0) / sc.length : null;
    const hi =
      sc.length >= MIN_GROUP ? Math.round((sc.filter((s) => s > 60).length / sc.length) * 100) : null;
    return { d, count: sc.length, avg, hi, lv: level(avg) };
  });

  const anyHarassment =
    n > 0 && n < MIN_GROUP && ad.items.some((it) => sel.some((r) => (r.answers || {})[it[0]] > 0));

  const c1 = sel.map((r) => r.comment_stress).filter(Boolean) as string[];
  const c2 = sel.map((r) => r.comment_change).filter(Boolean) as string[];
  const sortPt = (a: string, b: string) => a.localeCompare(b, "pt");

  function exportCsv() {
    if (!enough) {
      setNote(tx(`Só é possível exportar com ${MIN_GROUP} ou mais respostas no filtro.`, `Export is only possible with ${MIN_GROUP} or more responses in the filter.`));
      return;
    }
    const ids = DIMS.flatMap((d) => d.items.map((i) => i[0]));
    const cell = (v: unknown) => {
      const s = v === undefined || v === null ? "" : String(v);
      return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [["year", "workplace", "engagement", ...ids, "comment_stress", "comment_change"].join(";")];
    sel.forEach((r) =>
      lines.push(
        [r.year, r.workplace, r.engagement, ...ids.map((id) => (r.answers || {})[id]), r.comment_stress, r.comment_change]
          .map(cell)
          .join(";")
      )
    );
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psychosocial-survey-${f.year}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNote("");
  }

  async function analyse() {
    setAiBusy(true);
    setAiErr("");
    setAi("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...f, lang }),
      });
      const j = await res.json();
      if (!res.ok) {
        setAiErr(
          j.error === "not_configured"
            ? tx("A análise não está configurada. Defina ANTHROPIC_API_KEY no servidor.", "Analysis is not configured. Set ANTHROPIC_API_KEY on the server.")
            : j.error === "too_few"
            ? tx(`Precisa de ${MIN_GROUP} ou mais respostas no filtro.`, `Needs ${MIN_GROUP} or more responses in the filter.`)
            : tx("Não foi possível obter a análise. Tente novamente.", "Could not get the analysis. Please try again.")
        );
      } else {
        setAi(j.text);
      }
    } catch {
      setAiErr(tx("Não foi possível obter a análise. Tente novamente.", "Could not get the analysis. Please try again."));
    }
    setAiBusy(false);
  }

  async function copyAi() {
    try {
      await navigator.clipboard.writeText(ai);
      setNote(tx("Copiado.", "Copied."));
    } catch {
      setNote(tx("Selecione e copie manualmente.", "Select and copy manually."));
    }
  }

  const rate = invited > 0 ? Math.round((submitted / invited) * 100) : 0;

  return (
    <>
      <div className="filters">
        <label>
          <T pt="Ano" en="Year" />
          <select value={f.year} onChange={(e) => change({ year: e.target.value })}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label>
          <T pt="Local de trabalho" en="Workplace" />
          <select value={f.local} onChange={(e) => change({ local: e.target.value })}>
            <option value="">{tx("Todos", "All")}</option>
            {CTX_LOCAL.map((o) => (
              <option key={o[0]} value={o[0]}>{tx(o[1], o[2])}</option>
            ))}
          </select>
        </label>
        <label>
          <T pt="Vínculo" en="Type of engagement" />
          <select value={f.vinc} onChange={(e) => change({ vinc: e.target.value })}>
            <option value="">{tx("Todos", "All")}</option>
            {CTX_VINC.slice(0, 3).map((o) => (
              <option key={o[0]} value={o[0]}>{tx(o[1], o[2])}</option>
            ))}
          </select>
        </label>
        <button className="btn ghost" type="button" onClick={exportCsv}>
          <T pt="Exportar CSV anonimizado" en="Export anonymised CSV" />
        </button>
      </div>
      {note && <div className="msg warn" style={{ marginTop: 12 }}>{note}</div>}

      <div className="stack">
        <div className="panel">
          <h2>
            <T
              pt={`${n} ${n === 1 ? "resposta" : "respostas"} neste filtro`}
              en={`${n} ${n === 1 ? "response" : "responses"} in this filter`}
            />
          </h2>
          <p className="note" style={{ marginTop: 6 }}>
            <T
              pt={`${inYear.length} no total do ano. Adesão em ${year}: ${submitted} de ${invited} convidados (${rate}%). Por regra de anonimato, os resultados só aparecem com ${MIN_GROUP} ou mais respostas.`}
              en={`${inYear.length} in total for the year. Participation in ${year}: ${submitted} of ${invited} invited (${rate}%). For anonymity, results only appear with ${MIN_GROUP} or more responses.`}
            />
          </p>
        </div>

        {!enough && (
          <>
            <div className="msg warn">
              <T
                pt="Ainda não há respostas suficientes para mostrar resultados neste filtro. Alargue o filtro ou aguarde mais respostas."
                en="There are not yet enough responses to show results in this filter. Widen the filter or wait for more responses."
              />
            </div>
            {anyHarassment && (
              <div className="msg err">
                <strong><T pt="Alerta de assédio ou violência." en="Harassment or violence alert." /></strong>{" "}
                <T
                  pt="Pelo menos uma resposta indica exposição. Reveja o código de conduta e o canal de denúncia, sem tentar identificar quem respondeu."
                  en="At least one response reports exposure. Review the code of conduct and the reporting channel, without trying to identify who responded."
                />
              </div>
            )}
          </>
        )}

        {enough && (
          <>
            <div>
              <h2><T pt="Dimensões" en="Dimensions" /></h2>
              <p className="note">
                <T
                  pt="Pontuação de 0 a 100, em que valores altos indicam maior risco. Referência interna: até 40 baixo, 41 a 60 moderado, acima de 60 elevado. Ajuste estes limites à vossa avaliação de riscos."
                  en="Score from 0 to 100, where high values mean higher risk. Internal reference: up to 40 low, 41 to 60 moderate, above 60 high. Adjust these thresholds to your own risk assessment."
                />
              </p>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th><T pt="Dimensão" en="Dimension" /></th>
                      <th><T pt="Pontuação" en="Score" /></th>
                      <th></th>
                      <th><T pt="Nível" en="Level" /></th>
                      <th><T pt="% em nível elevado" en="% at high level" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimRows.map(({ d, count, avg, hi, lv }) => (
                      <tr key={d.id}>
                        <td>
                          <T pt={d.t[0]} en={d.t[1]} />
                          {count > 0 && count < MIN_GROUP && (
                            <div className="note"><T pt={`Só ${count} respostas`} en={`Only ${count} responses`} /></div>
                          )}
                        </td>
                        <td className="num">{avg === null ? "–" : Math.round(avg)}</td>
                        <td>
                          <div className="meter">
                            <i className={"fill-" + lv} style={{ width: avg === null ? 0 : Math.max(2, Math.min(100, avg)) + "%" }} />
                            <u style={{ left: "40%" }} />
                            <u style={{ left: "60%" }} />
                          </div>
                        </td>
                        <td>
                          <span className={"pill " + lv}>
                            <T pt={LEVEL_LABELS[lv][0]} en={LEVEL_LABELS[lv][1]} />
                          </span>
                        </td>
                        <td className="num">{hi === null ? "–" : hi + "%"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2><T pt={ad.t[0]} en={ad.t[1]} /></h2>
              <p className="note">
                <T
                  pt="Percentagem de respondentes que indicou cada situação pelo menos uma vez nos últimos 12 meses."
                  en="Percentage of respondents who reported each situation at least once in the last 12 months."
                />
              </p>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th><T pt="Situação" en="Situation" /></th>
                      <th><T pt="Pelo menos uma vez" en="At least once" /></th>
                      <th><T pt="Algumas vezes ou mais" en="A few times or more" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ad.items.map((it) => {
                      const v = sel.map((r) => (r.answers || {})[it[0]]).filter((x) => typeof x === "number");
                      if (!v.length) return null;
                      const any = v.filter((x) => x >= 1).length;
                      const often = v.filter((x) => x >= 2).length;
                      return (
                        <tr key={it[0]}>
                          <td><T pt={it[1]} en={it[2]} /></td>
                          <td className="num">{Math.round((any / v.length) * 100)}% ({any})</td>
                          <td className="num">{Math.round((often / v.length) * 100)}% ({often})</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2><T pt={cd.t[0]} en={cd.t[1]} /></h2>
              <p className="note"><T pt="Percentagem que concorda ou concorda totalmente." en="Percentage who agree or strongly agree." /></p>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th><T pt="Afirmação" en="Statement" /></th>
                      <th><T pt="Concordância" en="Agreement" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cd.items.map((it) => {
                      const v = sel.map((r) => (r.answers || {})[it[0]]).filter((x) => typeof x === "number");
                      if (!v.length) return null;
                      return (
                        <tr key={it[0]}>
                          <td><T pt={it[1]} en={it[2]} /></td>
                          <td className="num">{Math.round((v.filter((x) => x >= 4).length / v.length) * 100)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2><T pt="Comentários" en="Comments" /></h2>
              <p className="note">
                <T pt="Apresentados por ordem alfabética, sem data. Trate-os como confidenciais." en="Shown in alphabetical order, without dates. Treat them as confidential." />
              </p>
              {[
                { title: <T pt="O que mais pesa" en="What weighs most" />, list: c1 },
                { title: <T pt="O que mudar primeiro" en="What to change first" />, list: c2 },
              ].map((g, i) => (
                <div key={i}>
                  <h3 style={{ marginTop: 14 }}>{g.title} ({g.list.length})</h3>
                  {g.list.slice().sort(sortPt).map((x, j) => (
                    <div className="cmt" key={j}>{x}</div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="panel" style={{ display: "grid", gap: 12 }}>
          <h2><T pt="Análise com Claude" en="Analysis with Claude" /></h2>
          <p className="note">
            <T
              pt="Envia a Claude os resultados agregados do filtro atual e os comentários, para resumir riscos, temas e ações sugeridas. É um apoio à decisão e não substitui a avaliação de riscos feita pelo serviço de SST."
              en="Sends Claude the aggregated results for the current filter, plus the comments, to summarise risks, themes and suggested actions. It supports decisions and does not replace the risk assessment by your health and safety service."
            />
          </p>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn" type="button" onClick={analyse} disabled={!enough || aiBusy}>
              {aiBusy ? <T pt="A analisar…" en="Analysing…" /> : <T pt="Analisar resultados" en="Analyse results" />}
            </button>
            {ai && (
              <button className="btn ghost" type="button" onClick={copyAi}>
                <T pt="Copiar análise" en="Copy analysis" />
              </button>
            )}
            {!enough && (
              <span className="note">
                <T pt={`Precisa de ${MIN_GROUP} ou mais respostas no filtro.`} en={`Needs ${MIN_GROUP} or more responses in the filter.`} />
              </span>
            )}
          </div>
          {aiErr && <div className="msg err">{aiErr}</div>}
          {ai && <Markdown text={ai} />}
        </div>
      </div>
    </>
  );
}

/** Minimal, safe renderer for the headings, bullets and bold text the analysis uses. */
function Markdown({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
      /^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
    );
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      const items = list;
      blocks.push(
        <ul key={"u" + blocks.length}>
          {items.map((x, i) => (
            <li key={i}>{inline(x)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  text.split("\n").forEach((line) => {
    let m: RegExpExecArray | null;
    if ((m = /^#{1,4}\s+(.*)$/.exec(line))) {
      flush();
      blocks.push(<h3 key={"h" + blocks.length}>{inline(m[1])}</h3>);
    } else if ((m = /^\s*[-*]\s+(.*)$/.exec(line))) {
      list.push(m[1]);
    } else if (line.trim()) {
      flush();
      blocks.push(<p key={"p" + blocks.length}>{inline(line.trim())}</p>);
    }
  });
  flush();
  return <div className="ai-out">{blocks}</div>;
}
