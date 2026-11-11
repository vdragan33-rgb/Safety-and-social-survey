"use client";

import { useState } from "react";
import { T } from "./T";
import { useLang } from "@/lib/useLang";

type Entry = { email: string; role: "respondent" | "admin" };

export default function AccessManager({ initial, me }: { initial: Entry[]; me: string }) {
  const lang = useLang();
  const tx = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [list, setList] = useState<Entry[]>(initial);
  const [text, setText] = useState("");
  const [role, setRole] = useState<"respondent" | "admin">("respondent");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; pt: string; en: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function parse(s: string) {
    return s
      .split(/[\s,;]+/)
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const emails = parse(text);
    if (!emails.length) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/allowlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ emails, role }),
    });
    if (res.ok) {
      const map = new Map(list.map((x) => [x.email, x]));
      emails.forEach((email) => map.set(email, { email, role }));
      setList(Array.from(map.values()).sort((a, b) => a.email.localeCompare(b.email)));
      setText("");
      setMsg({ kind: "ok", pt: "Lista atualizada.", en: "List updated." });
    } else {
      setMsg({ kind: "err", pt: "Não foi possível atualizar. Verifique os emails.", en: "Could not update. Check the email addresses." });
    }
    setBusy(false);
  }

  async function remove(email: string) {
    if (!window.confirm(tx(`Remover ${email}?`, `Remove ${email}?`))) return;
    const res = await fetch("/api/admin/allowlist", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setList((l) => l.filter((x) => x.email !== email));
    else setMsg({ kind: "err", pt: "Não foi possível remover.", en: "Could not remove." });
  }

  async function setRoleFor(email: string, r: "respondent" | "admin") {
    const res = await fetch("/api/admin/allowlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ emails: [email], role: r }),
    });
    if (res.ok) setList((l) => l.map((x) => (x.email === email ? { ...x, role: r } : x)));
    else setMsg({ kind: "err", pt: "Não foi possível alterar.", en: "Could not change." });
  }

  return (
    <div className="stack">
      <div className="panel" style={{ display: "grid", gap: 12 }}>
        <h2><T pt="Quem pode aceder" en="Who has access" /></h2>
        <p className="note">
          <T
            pt="Só os emails desta lista recebem o código de entrada. Cole vários emails separados por vírgulas, espaços ou linhas."
            en="Only emails on this list receive a sign-in code. Paste several emails separated by commas, spaces or new lines."
          />
        </p>
        <form onSubmit={add} style={{ display: "grid", gap: 10 }}>
          <textarea
            className="field-input"
            style={{ minHeight: 90 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="nome@empresa.pt, outro@exemplo.com"
            aria-label="Emails"
          />
          <div className="inline-form">
            <label className="field">
              <span className="t"><T pt="Função" en="Role" /></span>
              <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="respondent">{tx("Respondente", "Respondent")}</option>
                <option value="admin">{tx("Administrador (vê resultados)", "Admin (sees results)")}</option>
              </select>
            </label>
            <button className="btn" type="submit" disabled={busy}>
              <T pt="Adicionar" en="Add" />
            </button>
          </div>
        </form>
        {msg && <div className={"msg " + msg.kind}>{tx(msg.pt, msg.en)}</div>}
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th><T pt="Função" en="Role" /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.email}>
                <td style={{ overflowWrap: "anywhere" }}>{x.email}{x.email === me ? " (eu)" : ""}</td>
                <td>
                  <select
                    value={x.role}
                    disabled={x.email === me}
                    onChange={(e) => setRoleFor(x.email, e.target.value as any)}
                    aria-label={"Role " + x.email}
                  >
                    <option value="respondent">{tx("Respondente", "Respondent")}</option>
                    <option value="admin">{tx("Administrador", "Admin")}</option>
                  </select>
                </td>
                <td>
                  {x.email !== me && (
                    <button className="btn danger small" type="button" onClick={() => remove(x.email)}>
                      <T pt="Remover" en="Remove" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr><td colSpan={3} className="note"><T pt="Ainda não há emails na lista." en="No emails on the list yet." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="note">
        <T
          pt="Remover um email impede novos códigos de entrada, mas não apaga respostas já submetidas, que não estão ligadas a nenhuma pessoa."
          en="Removing an email stops new sign-in codes but does not delete responses already submitted, which are not linked to any person."
        />
      </p>
    </div>
  );
}
