import { DIMS, CTX_LOCAL, CTX_VINC, type Dim } from "./survey-data";
import { MIN_GROUP } from "./constants";

export type Row = {
  year: number;
  workplace: string;
  engagement: string;
  answers: Record<string, number>;
  comment_stress: string | null;
  comment_change: string | null;
};

export const LEVEL_LABELS: Record<string, [string, string]> = {
  ok: ["Baixo", "Low"],
  warn: ["Moderado", "Moderate"],
  bad: ["Elevado", "High"],
  na: ["Sem dados", "No data"],
};

/** 0-100 risk score for one respondent and one dimension (higher = more risk). */
export function dimScore(d: Dim, answers: Record<string, number>): number | null {
  const vals: number[] = [];
  for (const it of d.items) {
    let v = answers[it[0]];
    if (typeof v !== "number") continue;
    if (it[3]) v = 6 - v;
    vals.push(v);
  }
  if (!vals.length) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const s = (mean - 1) * 25;
  return d.dir === "risk" ? s : 100 - s;
}

export function level(s: number | null): "ok" | "warn" | "bad" | "na" {
  if (s === null) return "na";
  return s <= 40 ? "ok" : s <= 60 ? "warn" : "bad";
}

export function findDim(id: string): Dim {
  return DIMS.find((d) => d.id === id)!;
}

/** Plain-text summary of the aggregated results, used for the AI analysis. */
export function buildSummary(
  rows: Row[],
  filters: { year: string; local: string; vinc: string }
): string {
  const loc = CTX_LOCAL.find((o) => o[0] === filters.local);
  const vin = CTX_VINC.find((o) => o[0] === filters.vinc);
  const lines: string[] = [];
  lines.push(
    `Year: ${filters.year}; workplace filter: ${loc ? loc[2] : "all"}; engagement filter: ${
      vin ? vin[2] : "all"
    }; responses: ${rows.length}.`
  );
  lines.push(
    "\nDIMENSIONS (score 0-100, higher = more risk; thresholds: <=40 low, 41-60 moderate, >60 high):"
  );
  for (const d of DIMS) {
    if (d.id === "assed" || d.id === "canal") continue;
    const sc: number[] = [];
    rows.forEach((r) => {
      const s = dimScore(d, r.answers || {});
      if (s !== null) sc.push(s);
    });
    if (sc.length < MIN_GROUP) {
      lines.push(`- ${d.t[1]}: fewer than ${MIN_GROUP} responses, not reported`);
      continue;
    }
    const avg = sc.reduce((a, b) => a + b, 0) / sc.length;
    const hi = Math.round((sc.filter((s) => s > 60).length / sc.length) * 100);
    lines.push(
      `- ${d.t[1]}: ${Math.round(avg)} (${LEVEL_LABELS[level(avg)][1]}), ${hi}% of respondents at high level (n=${sc.length})`
    );
  }
  const ad = findDim("assed");
  const cd = findDim("canal");
  lines.push(
    "\nHARASSMENT, VIOLENCE, DISCRIMINATION (share reporting at least once / a few times or more in the last 12 months):"
  );
  for (const it of ad.items) {
    const v = rows.map((r) => (r.answers || {})[it[0]]).filter((x) => typeof x === "number");
    if (!v.length) continue;
    lines.push(
      `- ${it[2]}: ${Math.round((v.filter((x) => x >= 1).length / v.length) * 100)}% / ${Math.round(
        (v.filter((x) => x >= 2).length / v.length) * 100
      )}%`
    );
  }
  lines.push("\nPREVENTION AND REPORTING (share who agree):");
  for (const it of cd.items) {
    const v = rows.map((r) => (r.answers || {})[it[0]]).filter((x) => typeof x === "number");
    if (!v.length) continue;
    lines.push(`- ${it[2]}: ${Math.round((v.filter((x) => x >= 4).length / v.length) * 100)}%`);
  }
  const c1 = rows.map((r) => r.comment_stress).filter(Boolean) as string[];
  const c2 = rows.map((r) => r.comment_change).filter(Boolean) as string[];
  lines.push(`\nCOMMENTS - what weighs most (${c1.length}):`);
  c1.forEach((x) => lines.push("* " + x.replace(/\s+/g, " ")));
  lines.push(`\nCOMMENTS - what to change first (${c2.length}):`);
  c2.forEach((x) => lines.push("* " + x.replace(/\s+/g, " ")));
  return lines.join("\n");
}
