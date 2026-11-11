"use client";

import { useState } from "react";
import { T } from "./T";
import { useLang } from "@/lib/useLang";

export default function LoginForm() {
  const lang = useLang();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"" | "send" | "code">("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStep("code");
    } catch {
      setError("send");
    }
    setBusy(false);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error();
      window.location.href = "/";
    } catch {
      setError("code");
      setBusy(false);
    }
  }

  return (
    <>
      <h2>
        <T pt="Entrar" en="Sign in" />
      </h2>
      {step === "email" ? (
        <form onSubmit={sendCode} style={{ display: "grid", gap: 12 }}>
          <p className="note">
            <T
              pt="Introduza o email para o qual recebeu o convite. Enviamos-lhe um código de 6 dígitos."
              en="Enter the email address you were invited on. We will send you a 6-digit code."
            />
          </p>
          <label className="field">
            <span className="t">Email</span>
            <input
              className="field-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            <T pt="Enviar código" en="Send code" />
          </button>
        </form>
      ) : (
        <form onSubmit={verify} style={{ display: "grid", gap: 12 }}>
          <p className="note">
            <T
              pt="Se o email estiver autorizado, enviámos um código. Pode demorar um minuto."
              en="If the email is authorised, we sent a code. It can take a minute."
            />
          </p>
          <label className="field">
            <span className="t">
              <T pt="Código" en="Code" />
            </span>
            <input
              className="field-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            <T pt="Entrar" en="Sign in" />
          </button>
          <button
            className="signout"
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
          >
            <T pt="Usar outro email" en="Use another email" />
          </button>
        </form>
      )}
      {error && (
        <div className="msg err" role="alert" lang={lang}>
          {error === "send" ? (
            <T
              pt="Não foi possível enviar o código. Tente novamente dentro de instantes."
              en="Could not send the code. Please try again in a moment."
            />
          ) : (
            <T pt="Código inválido ou expirado." en="Invalid or expired code." />
          )}
        </div>
      )}
    </>
  );
}
