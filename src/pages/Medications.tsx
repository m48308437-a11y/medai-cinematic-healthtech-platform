import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, ArrowUpRight, BadgeInfo, Beaker, Boxes, ChevronRight, Eye, FlaskConical,
  Pill as PillIcon, Search, ShieldAlert, Sparkles, TriangleAlert,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { MEDS } from "@/data/demo";
import { Pill, Reveal } from "@/components/ui";
import { cn } from "@/utils/cn";

export default function Medications() {
  const { t, lang, isFa } = useLang();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(MEDS[0].id);

  const filtered = useMemo(
    () => MEDS.filter((m) => (m.brand + m.generic[lang] + m.category[lang]).toLowerCase().includes(query.toLowerCase())),
    [query, lang],
  );
  const active = MEDS.find((m) => m.id === activeId) ?? MEDS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6">
      <Reveal className="text-center">
        <span className="relative inline-grid place-items-center">
          <span className="absolute h-16 w-16 rounded-full bg-neon/15 blur-xl" />
          <PillIcon className="relative h-9 w-9 text-neonb" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl"><span className="gradient-text">{t("med.title")}</span></h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mist">{t("med.sub")}</p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
        {/* list */}
        <Reveal>
          <div className="glass flex max-h-[760px] flex-col rounded-3xl p-4">
            <div className="relative mb-3">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("med.searchPh")}
                className="w-full rounded-xl border border-white/[0.08] bg-void/60 py-3 ps-9 pe-3 text-sm text-white outline-none placeholder:text-mist/60 focus:border-neon/40"
              />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pe-1">
              {filtered.map((m, i) => (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, x: isFa ? 18 : -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  onClick={() => setActiveId(m.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-start transition-all duration-300",
                    m.id === activeId
                      ? "border-neon/40 bg-neon/[0.09] shadow-[0_10px_36px_-14px_rgba(24,224,196,0.5)]"
                      : "border-white/[0.06] bg-void/40 hover:border-white/20",
                  )}
                >
                  <span className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors",
                    m.id === activeId ? "border-neon/40 bg-neon/15" : "border-white/10 bg-white/[0.04]",
                  )}>
                    <Beaker className={cn("h-4.5 w-4.5", m.id === activeId ? "text-neonb" : "text-mist")} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{m.brand}</span>
                    <span className="block truncate text-[11px] text-mist">{m.category[lang]}</span>
                  </span>
                  <ChevronRight className={cn("h-4 w-4 shrink-0 rtl:-scale-x-100", m.id === activeId ? "text-neonb" : "text-mist/50")} />
                </motion.button>
              ))}
              {filtered.length === 0 && <p className="py-10 text-center text-sm text-mist">—</p>}
            </div>
          </div>
        </Reveal>

        {/* detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + lang}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="neon-frame rounded-[1.75rem]"
          >
            <div className="glass rounded-[1.75rem] p-7 sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] tracking-wider text-mist/80 uppercase">
                    <Sparkles className="h-3.5 w-3.5 text-neon" /> {t("med.generic")}
                  </div>
                  <h2 className="mt-1 font-display text-3xl font-bold text-white">{active.brand}</h2>
                  <p className="mt-1 text-sm text-neonb/90">{active.generic[lang]}</p>
                </div>
                <Pill tone="azure">{active.category[lang]}</Pill>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Section icon={Eye} title={t("med.uses")}>
                  <div className="flex flex-wrap gap-2">
                    {active.uses[lang].map((u) => (
                      <span key={u} className="rounded-full border border-neon/25 bg-neon/[0.07] px-3 py-1.5 text-[12px] text-neonb">{u}</span>
                    ))}
                  </div>
                </Section>
                <Section icon={Boxes} title={t("med.forms")}>
                  <ul className="space-y-1.5">
                    {active.forms[lang].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-azure" />{f}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section icon={ShieldAlert} title={t("med.precautions")} tone="warn">
                  <ul className="space-y-1.5">
                    {active.precautions[lang].map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm leading-relaxed text-white/85">
                        <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0 text-warn/80" />{p}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section icon={BadgeInfo} title={t("med.sideEffects")}>
                  <div className="flex flex-wrap gap-2">
                    {active.sideEffects[lang].map((s) => (
                      <span key={s} className="rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-[12px] text-mist">{s}</span>
                    ))}
                  </div>
                </Section>
              </div>

              <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/[0.07] p-5">
                <div className="flex items-center gap-2 font-display text-sm font-semibold text-danger">
                  <TriangleAlert className="h-4.5 w-4.5" /> {t("med.interactions")}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.interactions[lang].map((i) => (
                    <span key={i} className="rounded-full border border-danger/35 bg-danger/10 px-3 py-1.5 text-[12px] text-[#ffb9c0]">{i}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-warn/25 bg-warn/[0.06] p-4 text-[13px] leading-relaxed text-warn/90">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
                {t("med.disclaimer")}
              </div>

              <div className="mt-6 flex justify-end">
                <a
                  href={`https://medlineplus.gov/druginformation.html`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-mist transition-colors hover:text-neonb"
                >
                  MedlinePlus Drug Information <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Reveal className="mt-8">
        <div className="text-center text-[11px] text-mist/60">
          {t("med.commonly")}: {MEDS.slice(0, 5).map((m) => m.brand).join(" · ")}
        </div>
      </Reveal>
    </div>
  );
}

function Section({ icon: Icon, title, children, tone }: {
  icon: typeof Eye; title: string; children: React.ReactNode; tone?: "warn";
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white/90">
        <span className={cn("grid h-7 w-7 place-items-center rounded-lg border", tone === "warn" ? "border-warn/30 bg-warn/[0.08]" : "border-neon/25 bg-neon/[0.08]")}>
          <Icon className={cn("h-3.5 w-3.5", tone === "warn" ? "text-warn" : "text-neonb")} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}
