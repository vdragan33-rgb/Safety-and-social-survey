"use client";

import { useEffect, useState } from "react";
import type { Lang } from "./constants";

/** Current UI language for client components that need a plain string (selects, exports). */
export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("pt");
  useEffect(() => {
    const read = () =>
      setLang(document.documentElement.getAttribute("data-ui") === "en" ? "en" : "pt");
    read();
    window.addEventListener("langchange", read);
    return () => window.removeEventListener("langchange", read);
  }, []);
  return lang;
}
