import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { dictionaries, languages, resolve } from "./translations";
import type { Dict, Lang } from "./translations";

interface LangCtx {
  lang: Lang;
  dir: "ltr" | "rtl";
  isFa: boolean;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
  arr: (path: string) => string[];
  dict: Dict;
  num: (n: number, opts?: Intl.NumberFormatOptions) => string;
}

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = "medai_lang";

function detectInitial(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fa" || saved === "en") return saved;
    if (navigator.language?.toLowerCase().startsWith("fa")) return "fa";
  } catch {
    /* noop */
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);
  const dir = languages.find((l) => l.id === lang)?.dir ?? "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* noop */
    }
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (path: string) => {
      const v = resolve(dictionaries[lang], path) ?? resolve(dictionaries.en, path);
      if (typeof v === "string") return v;
      return path;
    },
    [lang],
  );

  const arr = useCallback(
    (path: string) => {
      const v = resolve(dictionaries[lang], path) ?? resolve(dictionaries.en, path);
      return Array.isArray(v) ? (v as string[]) : [];
    },
    [lang],
  );

  const num = useCallback(
    (n: number, opts?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", opts).format(n),
    [lang],
  );

  const value = useMemo<LangCtx>(
    () => ({ lang, dir, isFa: lang === "fa", setLang, t, arr, dict: dictionaries[lang], num }),
    [lang, dir, setLang, t, arr, num],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

/** Detect Persian/Arabic script in a message */
export function detectMessageLang(text: string): Lang {
  return /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? "fa" : "en";
}
