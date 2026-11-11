"use client";

import { useState } from "react";
import type { Lang } from "@/lib/constants";

export default function LangSwitch({ initial }: { initial: Lang }) {
  const [lang, setLang] = useState<Lang>(initial);

  function choose(l: Lang) {
    setLang(l);
    document.documentElement.setAttribute("data-ui", l);
    document.documentElement.lang = l;
    document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }

  return (
    <div className="lang" role="group" aria-label="Idioma / Language">
      {(["pt", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => choose(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
