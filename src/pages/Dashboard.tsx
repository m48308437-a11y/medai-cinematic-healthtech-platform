import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, Bell, CalendarDays, Check, Copy, Droplets, FileText, Flame, Footprints,
  Frown, HeartPulse, Meh, MessagesSquare, MoonStar, Plus, SendHorizonal, Smile,
  Sparkles, Stethoscope, Thermometer, Wind, X,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import {
  ACTIVITY_WEEK, CONSULTS, HR_WEEK, HR_WEEK_B, JOURNAL, MED_SCHEDULE, REMINDERS_INIT, SLEEP_WEEK,
} from "@/data/demo";
import type { JournalEntryT } from "@/data/demo";
import { BarChart, LineChart, RadialRing, Sparkline } from "@/components/charts";
import { MagneticButton, Pill, Reveal } from "@/components/ui";
import { cn } from "@/utils/cn";

const MOOD_ICONS = [Frown, Meh, Smile];
const MOOD_COLORS = ["text-danger", "text-warn", "text-success"];

function useUser() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem("medai_auth");
      if (raw) return JSON.parse(raw) as { name: string };
    } catch { /* */ }
    return { name: "Aria" };
  }, []);
}

export default function Dashboard() {
  const { t, lang, num, arr } = useLang();
  const remTypes = arr("dash.remTypes");
  const user = useUser();
  const [journal, setJournal] = useState(JOURNAL);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<0 | 1 | 2>(1);
  const [meds, setMeds] = useState(MED_SCHEDULE);
  const [reminders, setReminders] = useState(REMINDERS_INIT);
  const [remTitle, setRemTitle] = useState("");
  const [remType, setRemType] = useState(0);
  const [showAddRem, setShowAddRem] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const today = new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", { dateStyle: "full" }).format(new Date(2026, 1, 8));

  function addNote() {
    if (!note.trim()) return;
    setJournal((j) => [{ id: Date.now(), date: t("common.today"), mood, note: { en: note, fa: note }, tag: { en: "Note", fa: "یادداشت" } }, ...j]);
    setNote("");
  }

  function addReminder() {
    if (!remTitle.trim()) return;
    setReminders((r) => [...r, { id: Date.now(), type: remType, title: { en: remTitle, fa: remTitle }, when: t("dash.upcoming"), done: false }]);
    setRemTitle("");
    setShowAddRem(false);
  }

  const summaryText = [
    `MEDAI · Health Summary`,
    `— ${t("dash.mainConcern")}: ${lang === "fa" ? "سردرد گاه‌به‌گاه عصرها و پایش خواب" : "Occasional evening headaches and sleep tracking"}`,
    `— ${t("dash.symptoms")}: ${journal.slice(0, 3).map((j) => j.note[lang]).join(" | ")}`,
    `— ${t("dash.duration")}: ${lang === "fa" ? "دو هفته اخیر" : "Past two weeks"}`,
    `— ${t("dash.notes")}: ${lang === "fa" ? "خواب بهبود یافته؛ قند پایدار؛ استرس متغیر" : "Sleep improved; glucose steady; variable stress"}`,
    `— ${t("dash.questionsDr")}: ${lang === "fa" ? "آیا برای سردرد عصری بررسی فشار خون یا چشم لازم است؟" : "Should evening headaches prompt a blood-pressure or vision check?"}`,
  ].join("\n");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6">
      {/* header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-mist"><CalendarDays className="h-3.5 w-3.5 text-neon" />{today}</div>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            {t("dash.hello")}<span className="gradient-text">، {user.name}</span>
          </h1>
          <p className="mt-1.5 text-sm text-mist">{t("dash.sub")} <span className="text-neonb">{t("common.today")}</span></p>
        </div>
        <MagneticButton onClick={() => setSummaryOpen(true)} className="px-6 py-3">
          <FileText className="h-4 w-4" /> {t("dash.genSummary")}
        </MagneticButton>
      </Reveal>

      {/* KPI row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal><Kpi className="justify-between">
          <div>
            <div className="text-xs text-mist">{t("dash.score")}</div>
            <div className="mt-1 font-display text-3xl font-bold text-white">{num(86)}<span className="text-sm text-mist">/100</span></div>
            <div className="mt-1 text-[11px] text-success">+4 · {t("preview.week")}</div>
          </div>
          <RadialRing value={86} size={86} stroke={8}><HeartPulse className="h-5 w-5 text-neonb" /></RadialRing>
        </Kpi></Reveal>
        <Reveal delay={0.07}><Kpi className="justify-between">
          <div>
            <div className="text-xs text-mist">{t("dash.trend")}</div>
            <div className="mt-1 font-display text-3xl font-bold text-white">{num(72)} <span className="text-sm font-normal text-mist">{t("dash.hrB")}</span></div>
            <div className="mt-1 text-[11px] text-mist">{t("dash.sleepB")}: {num(7.1, { maximumFractionDigits: 1 })} h</div>
          </div>
          <Sparkline data={HR_WEEK} height={44} />
        </Kpi></Reveal>
        <Reveal delay={0.14}><Kpi className="justify-between">
          <div>
            <div className="text-xs text-mist">{t("dash.sleep")}</div>
            <div className="mt-1 font-display text-3xl font-bold text-white">{num(7.1, { maximumFractionDigits: 1 })}<span className="text-sm font-normal text-mist"> h</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#9dbcff]"><MoonStar className="h-3 w-3" />{lang === "fa" ? "خواب عمیق ۱٫۸ ساعت" : "Deep sleep 1.8 h"}</div>
          </div>
          <Sparkline data={SLEEP_WEEK} color="#5b8cff" height={44} />
        </Kpi></Reveal>
        <Reveal delay={0.21}><Kpi className="justify-between">
          <div>
            <div className="text-xs text-mist">{t("dash.activity")}</div>
            <div className="mt-1 font-display text-3xl font-bold text-white">{num(8412)}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-warn"><Flame className="h-3 w-3" />{num(21)} {t("dash.streak")}</div>
          </div>
          <Sparkline data={ACTIVITY_WEEK} color="#ffb547" height={44} />
        </Kpi></Reveal>
      </div>

      {/* main grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* left 2 cols */}
        <div className="space-y-5 lg:col-span-2">
          {/* heart chart */}
          <Reveal><Panel title={t("dash.trend")} icon={HeartPulse} right={<Pill tone="neon">{t("preview.week")}</Pill>}>
            <LineChart data={HR_WEEK} compare={HR_WEEK_B} height={200} labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]} />
          </Panel></Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            <Reveal><Panel title={t("dash.activity")} icon={Footprints}>
              <BarChart data={ACTIVITY_WEEK} height={150} labels={["S", "S", "M", "T", "W", "T", "F"]} />
            </Panel></Reveal>
            {/* vitals */}
            <Reveal delay={0.08}><Panel title={t("dash.vitals")} icon={Activity}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Droplets, label: "SpO₂", v: `98%`, tone: "text-neonb" },
                  { icon: HeartPulse, label: lang === "fa" ? "فشار خون" : "BP", v: "118/76", tone: "text-[#9dbcff]" },
                  { icon: Wind, label: "HRV", v: `61 ms`, tone: "text-success" },
                  { icon: Thermometer, label: lang === "fa" ? "دما" : "Temp", v: "36.6°", tone: "text-warn" },
                ].map((vi) => (
                  <div key={vi.label} className="rounded-xl border border-white/[0.06] bg-void/50 p-3">
                    <vi.icon className={cn("h-4 w-4", vi.tone)} />
                    <div className="mt-2 font-display text-lg font-bold text-white" dir="ltr">{vi.v}</div>
                    <div className="text-[10px] text-mist">{vi.label}</div>
                  </div>
                ))}
              </div>
            </Panel></Reveal>
          </div>

          {/* consultations */}
          <Reveal><Panel title={t("dash.consult")} icon={MessagesSquare} right={<Pill tone="azure" dot={false}>{num(CONSULTS.length)}</Pill>}>
            <div className="space-y-2.5">
              {CONSULTS.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group flex items-center justify-between rounded-2xl border border-white/[0.05] bg-void/40 px-4 py-3 transition-all hover:border-neon/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", c.tone === "neon" ? "border-neon/25 bg-neon/[0.08]" : c.tone === "azure" ? "border-azure/25 bg-azure/[0.08]" : "border-white/10 bg-white/[0.04]")}>
                      <Sparkles className={cn("h-4 w-4", c.tone === "neon" ? "text-neonb" : "text-[#9dbcff]")} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white/90">{c.topic[lang]}</div>
                      <div className="text-[11px] text-mist">{c.date} · {c.dur}</div>
                    </div>
                  </div>
                  <Pill tone="success">{t("hero.stable")}</Pill>
                </motion.div>
              ))}
            </div>
          </Panel></Reveal>
        </div>

        {/* right col */}
        <div className="space-y-5">
          {/* meds */}
          <Reveal><Panel title={t("dash.meds")} icon={HeartPulse}>
            <div className="space-y-2.5">
              {meds.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => setMeds((ms) => ms.map((x, j) => (j === i ? { ...x, taken: !x.taken } : x)))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-start transition-all duration-300",
                    m.taken ? "border-success/25 bg-success/[0.05]" : "border-warn/25 bg-warn/[0.05]",
                  )}
                >
                  <div>
                    <div className="text-sm font-medium text-white/90">{m.name} <span className="text-[11px] font-normal text-mist">{m.dose}</span></div>
                    <div className="text-[11px] text-mist" dir="ltr">{m.time}</div>
                  </div>
                  <Pill tone={m.taken ? "success" : "warn"}>{m.taken ? t("dash.taken") : t("dash.upcoming")}</Pill>
                </button>
              ))}
            </div>
          </Panel></Reveal>

          {/* journal */}
          <Reveal delay={0.06}><Panel title={t("dash.journal")} icon={FileText}>
            <div className="mb-3.5 flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("dash.journalPH")}
                  rows={2}
                  dir="auto"
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-void/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist/50 focus:border-neon/40"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {MOOD_ICONS.map((Icon, i) => (
                      <button key={i} onClick={() => setMood(i as 0 | 1 | 2)}
                        className={cn("grid h-8 w-8 place-items-center rounded-lg border transition-all",
                          mood === i ? "border-neon/50 bg-neon/10" : "border-white/[0.08] hover:border-white/25")}>
                        <Icon className={cn("h-4 w-4", MOOD_COLORS[i])} />
                      </button>
                    ))}
                  </div>
                  <button onClick={addNote} disabled={!note.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-[#032220] transition-all hover:scale-105 disabled:opacity-30">
                    <SendHorizonal className="h-4 w-4 rtl:-scale-x-100" />
                  </button>
                </div>
              </div>
            </div>
            {/* mini calendar */}
            <MiniCal />
            {/* timeline */}
            <div className="mt-4 max-h-[280px] space-y-0 overflow-y-auto pe-1">
              {journal.slice(0, 5).map((j, i) => <JournalRow key={j.id} j={j} i={i} last={i === Math.min(journal.length, 5) - 1} />)}
            </div>
          </Panel></Reveal>

          {/* reminders */}
          <Reveal delay={0.12}><Panel title={t("dash.reminders")} icon={Bell}
            right={<button onClick={() => setShowAddRem((v) => !v)} className="flex items-center gap-1 text-[11px] text-neonb transition-colors hover:text-white"><Plus className="h-3.5 w-3.5" />{t("dash.addReminder")}</button>}>
            <AnimatePresence>
              {showAddRem && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mb-3 space-y-2 rounded-xl border border-white/[0.07] bg-void/50 p-3">
                    <input value={remTitle} onChange={(e) => setRemTitle(e.target.value)} placeholder={t("dash.addReminder")} dir="auto"
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-neon/40" />
                    <div className="flex flex-wrap gap-1.5">
                      {remTypes.map((labelTxt, i) => (
                        <button key={i} onClick={() => setRemType(i)} className={cn("rounded-full border px-2.5 py-1 text-[10px] transition-all", remType === i ? "border-neon bg-neon/15 text-neonb" : "border-white/10 text-mist")}>
                          {labelTxt}
                        </button>
                      ))}
                    </div>
                    <button onClick={addReminder} className="w-full rounded-lg bg-neon py-2 text-xs font-semibold text-[#032220] hover:brightness-110">{t("common.add")}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2.5">
              {reminders.map((r) => (
                <div key={r.id} className={cn("flex items-center justify-between gap-3 rounded-2xl border px-4 py-3", r.done ? "border-white/[0.05] opacity-55" : "border-white/[0.07] bg-void/40")}>
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      onClick={() => setReminders((rs) => rs.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)))}
                      className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all", r.done ? "border-success bg-success/20 text-success" : "border-white/20 hover:border-neon")}
                    >
                      {r.done && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <div className={cn("truncate text-sm text-white/90", r.done && "line-through")}>{r.title[lang]}</div>
                      <div className="text-[11px] text-mist" dir="ltr">{r.when}</div>
                    </div>
                  </div>
                  <Pill tone={["azure", "neon", "warn", "dim"][r.type] as "azure" | "neon" | "warn" | "dim"} dot={false}>{remTypes[r.type]}</Pill>
                </div>
              ))}
            </div>
          </Panel></Reveal>
        </div>
      </div>

      {/* summary modal */}
      <AnimatePresence>
        {summaryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setSummaryOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 34 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 18 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="neon-frame relative w-full max-w-lg"
            >
              <div className="glass max-h-[86vh] overflow-y-auto rounded-[1.6rem] p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white"><Stethoscope className="h-5 w-5 text-neonb" />{t("dash.summaryTitle")}</h3>
                    <p className="mt-1 text-xs text-mist">{t("dash.summarySub")}</p>
                  </div>
                  <button onClick={() => setSummaryOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <pre className="mt-5 rounded-2xl border border-white/[0.07] bg-void/70 p-4 font-body text-[13px] leading-relaxed whitespace-pre-wrap text-white/85" dir={lang === "fa" ? "rtl" : "ltr"}>
                  {summaryText}
                </pre>
                <div className="mt-5 flex gap-3">
                  <MagneticButton className="flex-1 py-3" onClick={async () => {
                    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* */ }
                  }}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t("common.copied") : t("dash.copyAll")}
                  </MagneticButton>
                  <MagneticButton variant="ghost" className="py-3" onClick={() => setSummaryOpen(false)}>{t("common.close")}</MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JournalRow({ j, i, last }: { j: JournalEntryT; i: number; last: boolean }) {
  const { lang } = useLang();
  const MoodIcon = MOOD_ICONS[j.mood];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      className="relative flex gap-3 pb-4"
    >
      <div className="flex flex-col items-center">
        <span className={cn("z-10 grid h-8 w-8 place-items-center rounded-full border border-white/[0.09] bg-void", MOOD_COLORS[j.mood])}>
          <MoodIcon className="h-4 w-4" />
        </span>
        {!last && <span className="w-px flex-1 bg-gradient-to-b from-neon/30 to-transparent" />}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] tracking-wider text-mist/70 uppercase">{j.date}</span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] text-mist">{j.tag[lang]}</span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-white/85" dir="auto">{j.note[lang]}</p>
      </div>
    </motion.div>
  );
}

function MiniCal() {
  const { t, lang, num } = useLang();
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const marked = [1, 3, 5, 6];
  const heads = lang === "fa" ? ["ش", "ی", "د", "س", "چ", "پ", "ج"] : ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className="rounded-xl border border-white/[0.06] bg-void/40 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] text-mist">
        <span className="font-medium text-white/80">{t("dash.calendar")}</span>
        <CalendarIcon />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-mist/60">
        {heads.map((h, i) => <span key={i}>{h}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div key={d} className={cn(
            "relative grid h-6.5 place-items-center rounded-md text-[11px]",
            d === 8 ? "bg-neon font-semibold text-[#032220] shadow-[0_0_14px_rgba(24,224,196,0.6)]" : "text-white/70 hover:bg-white/[0.06]",
          )}>
            {num(d)}
            {marked.includes(d) && <span className="absolute bottom-0.5 h-0.5 w-0.5 rounded-full bg-neonb" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return <CalendarDays className="h-3.5 w-3.5 text-neon" />;
}

function Kpi({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass flex h-full items-center rounded-3xl p-5 transition-all duration-500 hover:border-neon/25 hover:shadow-[0_20px_50px_-20px_rgba(24,224,196,0.3)]", className)}>
      {children}
    </div>
  );
}

function Panel({ title, icon: Icon, right, children }: {
  title: string; icon: typeof Activity; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-neon/25 bg-neon/[0.08]"><Icon className="h-4 w-4 text-neonb" /></span>
          {title}
        </h3>
        {right}
      </div>
      {children}
    </div>
  );
}
