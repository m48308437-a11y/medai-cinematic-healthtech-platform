import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, FileUp, FlaskConical, ListChecks, MessageCircleQuestion,
  Play, RotateCcw, Sparkles,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { LAB_TESTS } from "@/data/demo";
import type { LabTest } from "@/data/demo";
import { MagneticButton, Pill, Reveal } from "@/components/ui";
import { RangeBar } from "@/components/charts";
import { cn } from "@/utils/cn";

type Status = "in" | "border" | "out";

function statusOf(t: LabTest, v: number): Status {
  if (v >= t.low && v <= t.high) return "in";
  const span = t.high - t.low || 1;
  if (Math.min(Math.abs(v - t.low), Math.abs(v - t.high)) <= span * 0.18) return "border";
  return "out";
}

export default function Labs() {
  const { t, lang, num, arr } = useLang();
  const [values, setValues] = useState<Record<string, string>>({});
  const [analyzed, setAnalyzed] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsePct, setParsePct] = useState(0);
  const [parsed, setParsed] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const entered = useMemo(
    () => LAB_TESTS.filter((lt) => values[lt.id] !== undefined && values[lt.id] !== "" && !isNaN(Number(values[lt.id]))),
    [values],
  );

  const stats = useMemo(() => {
    let inR = 0, bor = 0, out = 0;
    for (const lt of entered) {
      const s = statusOf(lt, Number(values[lt.id]));
      if (s === "in") inR++; else if (s === "border") bor++; else out++;
    }
    return { inR, bor, out };
  }, [entered, values]);

  function fakeUpload() {
    if (parsing) return;
    setParsing(true);
    setParsed(false);
    setParsePct(0);
    const iv = setInterval(() => {
      setParsePct((p) => {
        const n = p + Math.random() * 18;
        if (n >= 100) {
          clearInterval(iv);
          setParsing(false);
          setParsed(true);
          setValues((v) => ({ ...v, hgb: "11.2", ldl: "138", vitd: "22" }));
          return 100;
        }
        return n;
      });
    }, 180);
  }

  function analyze() {
    setAnalyzed(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }

  const tone = (s: Status): "success" | "warn" | "danger" => (s === "in" ? "success" : s === "border" ? "warn" : "danger");
  const label = (s: Status) => (s === "in" ? t("lab.inRange") : s === "border" ? t("lab.borderline") : t("lab.outOfRange"));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6">
      <Reveal className="text-center">
        <span className="relative inline-grid place-items-center">
          <span className="absolute h-16 w-16 rounded-full bg-azure/20 blur-xl" />
          <FlaskConical className="relative h-9 w-9 text-[#9dbcff]" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl"><span className="gradient-text">{t("lab.title")}</span></h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mist">{t("lab.sub")}</p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* left: upload */}
        <Reveal>
          <div className="glass sticky top-24 flex flex-col gap-5 rounded-3xl p-6">
            <button
              onClick={fakeUpload}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.12] px-6 py-9 transition-all duration-500 hover:border-neon/50 hover:bg-neon/[0.04]"
            >
              <span className="mb-3 grid h-13 w-13 place-items-center rounded-2xl border border-neon/25 bg-neon/[0.08] p-3.5 transition-transform duration-500 group-hover:scale-110">
                <FileUp className="h-6 w-6 text-neonb" />
              </span>
              <span className="font-display text-sm font-semibold text-white">{t("lab.upload")}</span>
              <span className="mt-1.5 text-center text-[11px] leading-relaxed text-mist">{t("lab.uploadHint")}</span>
              {(parsing || parsed) && (
                <span className="mt-4 w-full">
                  <span className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08] block">
                    <motion.span className="block h-full rounded-full bg-gradient-to-r from-neon to-neonb" animate={{ width: `${parsePct}%` }} transition={{ ease: "easeOut" }} />
                  </span>
                  <span className={cn("mt-2 flex items-center gap-1.5 text-[11px]", parsed ? "text-success" : "text-mist")}>
                    {parsed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5 animate-pulse" />}
                    {parsed ? t("lab.parsedOk") : `${t("lab.parsing")} · ${num(Math.floor(parsePct))}%`}
                  </span>
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 text-[11px] tracking-widest text-mist/60 uppercase">
              <span className="h-px flex-1 bg-white/[0.08]" />{t("lab.orManual")}<span className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <div className="max-h-[380px] space-y-2.5 overflow-y-auto pe-1">
              {LAB_TESTS.map((lt) => (
                <label key={lt.id} className={cn(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all",
                  entered.includes(lt) ? "border-neon/35 bg-neon/[0.06]" : "border-white/[0.07] bg-void/50 hover:border-white/20",
                )}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-white/90">{lt.name[lang]}</span>
                    <span className="text-[10px] text-mist/70">{lt.unit} · {num(lt.low)}–{num(lt.high)}</span>
                  </span>
                  <input
                    inputMode="decimal"
                    dir="ltr"
                    placeholder="—"
                    value={values[lt.id] ?? ""}
                    onChange={(e) => { setAnalyzed(false); setValues((v) => ({ ...v, [lt.id]: e.target.value })); }}
                    className="w-20 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-end font-display text-sm text-white outline-none focus:border-neon/50"
                  />
                </label>
              ))}
            </div>

            <MagneticButton onClick={analyze} className={cn("w-full py-3.5", entered.length === 0 && "pointer-events-none opacity-40")}>
              <Play className="h-4 w-4" /> {t("lab.analyze")}
              {entered.length > 0 && <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px]">{num(entered.length)}</span>}
            </MagneticButton>
          </div>
        </Reveal>

        {/* right: results */}
        <div ref={resultsRef} className="scroll-mt-28">
          <AnimatePresence mode="wait">
            {analyzed && entered.length > 0 ? (
              <motion.div key="res" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }} className="space-y-5">
                {/* summary */}
                <div className="neon-frame rounded-3xl">
                  <div className="glass grid grid-cols-3 gap-3 rounded-3xl p-6">
                    {[
                      { n: stats.inR, label: t("lab.inRange"), tone: "success" as const },
                      { n: stats.bor, label: t("lab.borderline"), tone: "warn" as const },
                      { n: stats.out, label: t("lab.outOfRange"), tone: "danger" as const },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className={cn("font-display text-3xl font-bold", s.tone === "success" ? "text-success" : s.tone === "warn" ? "text-warn" : "text-danger")}>{num(s.n)}</div>
                        <Pill tone={s.tone} className="mt-2">{s.label}</Pill>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 text-[13px] leading-relaxed text-mist">
                  <strong className="text-white">{num(stats.inR)}</strong> {t("lab.sumIn")} · <strong className="text-white">{num(stats.bor + stats.out)}</strong> {t("lab.sumOut")}
                </p>

                {/* per test */}
                {entered.map((lt, i) => {
                  const v = Number(values[lt.id]);
                  const s = statusOf(lt, v);
                  return (
                    <motion.div
                      key={lt.id}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      className="glass rounded-2xl p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-base font-semibold text-white">{lt.name[lang]}</h3>
                        <Pill tone={tone(s)}>{label(s)}</Pill>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                        <div>
                          <div className="text-[10px] tracking-wider text-mist/70 uppercase">{t("lab.value")}</div>
                          <div className="font-display text-xl font-bold text-white" dir="ltr">{num(v)} <span className="text-[11px] font-normal text-mist">{lt.unit}</span></div>
                        </div>
                        <RangeBar value={v} low={lt.low} high={lt.high} />
                        <div className="text-[11px] text-mist whitespace-nowrap" dir="ltr">{t("lab.range")}: {num(lt.low)}–{num(lt.high)}</div>
                      </div>
                      <div className="mt-4 rounded-xl border border-white/[0.05] bg-void/50 p-3.5">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-neonb"><ListChecks className="h-3.5 w-3.5" />{t("lab.explanation")}</div>
                        <p className="text-[13px] leading-relaxed text-mist">{lt.explain[lang]}</p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* questions */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                    <MessageCircleQuestion className="h-4.5 w-4.5 text-azure" /> {t("lab.questions")}
                  </h3>
                  <ol className="mt-4 space-y-2.5">
                    {arr("lab.qList").map((q, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/85">
                        <span className="grid h-5.5 w-5.5 shrink-0 place-items-center rounded-full bg-azure/15 font-display text-[10px] font-bold text-[#9dbcff]">{num(i + 1)}</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-warn/25 bg-warn/[0.06] p-4 text-[13px] leading-relaxed text-warn/90">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {t("lab.disclaimer")}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-white/[0.09] bg-white/[0.01]">
                <div className="max-w-xs text-center">
                  <FlaskConical className="mx-auto h-10 w-10 text-mist/40" />
                  <p className="mt-4 text-sm leading-relaxed text-mist">{t("lab.sub")}</p>
                  <p className="mt-2 text-[11px] text-mist/60">{t("sym.pickSub")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {analyzed && (
            <div className="mt-5 flex justify-center">
              <MagneticButton variant="ghost" onClick={() => { setAnalyzed(false); setValues({}); setParsed(false); setParsePct(0); }}>
                <RotateCcw className="h-4 w-4" /> {t("sym.restart")}
              </MagneticButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
