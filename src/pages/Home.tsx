import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, BadgeCheck, BellRing, BookOpenText, BrainCircuit, CheckCheck, ChevronDown,
  Database, FingerprintPattern, FlaskConical, HeartPulse, Layers, MessageSquareHeart, NotebookPen,
  Pill as PillIcon, Radar, ScanEye, Search, ShieldCheck, Slice, Sparkles, Stethoscope,
  TextCursorInput, XCircle, Activity, Cog,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import AICore from "@/three/AICore";
import { BarChart, LineChart, RadialRing, Sparkline } from "@/components/charts";
import { Counter, ECGLine, MagneticButton, Pill, Reveal, SectionHeading, TiltCard } from "@/components/ui";
import { ACTIVITY_WEEK, HR_WEEK, JOURNAL } from "@/data/demo";

/* ------------------------------- Hero ------------------------------ */

function FloatCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >
      <motion.div
        animate={reduced ? undefined : { y: [-9, 9, -9] }}
        transition={{ duration: 7 + delay * 3, repeat: Infinity, ease: "easeInOut", delay }}
        className="glass rounded-2xl p-4 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function HeartCard() {
  const { t, num } = useLang();
  return (
    <div className="w-44">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-mist"><HeartPulse className="h-3.5 w-3.5 text-danger" />{t("hero.cardHeart")}</span>
        <span className="h-2 w-2 rounded-full bg-danger animate-pulse-dot" />
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold text-white">{num(72)}</span>
        <span className="text-[10px] tracking-wider text-mist">{t("hero.bpm")}</span>
      </div>
      <ECGLine height={30} className="mt-1" />
    </div>
  );
}

function AIStatusCard() {
  const { t } = useLang();
  return (
    <div className="w-44">
      <div className="flex items-center gap-1.5 text-[11px] text-mist"><BrainCircuit className="h-3.5 w-3.5 text-neonb" />{t("hero.cardAI")}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="relative grid h-7 w-7 place-items-center">
          <span className="absolute inset-0 rounded-full border border-neon/50" />
          <span className="absolute inset-0 rounded-full border-t-2 border-neonb animate-spin" style={{ animationDuration: "1.4s" }} />
          <Sparkles className="h-3 w-3 text-neonb" />
        </span>
        <div>
          <div className="font-display text-sm font-semibold text-neonb">{t("hero.analyzing")}</div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 shimmer-line rounded-full" /></div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard() {
  const { t } = useLang();
  return (
    <div className="flex w-44 items-center gap-3">
      <RadialRing value={86} size={58} stroke={6}>
        <span className="font-display text-sm font-bold text-white">86</span>
      </RadialRing>
      <div>
        <div className="text-[11px] text-mist">{t("hero.cardOverview")}</div>
        <Pill tone="success" className="mt-1.5">{t("hero.stable")}</Pill>
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden pt-32 pb-10 sm:pt-36">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* headline */}
        <div className="relative z-20 mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal y={18}>
            <Pill tone="neon" className="backdrop-blur-md">{t("hero.badge")}</Pill>
          </Reveal>
          <h1 className="mt-7 font-display font-bold tracking-tight">
            <span className="block overflow-hidden">
              <motion.span
                className="block text-[13vw] leading-[0.98] text-white sm:text-7xl lg:text-[86px]"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.12, ease: [0.19, 1, 0.22, 1] }}
              >
                {t("hero.titleA")}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-3">
              <motion.span
                className="gradient-text glow-text block text-[13vw] leading-[0.98] sm:text-7xl lg:text-[86px]"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.26, ease: [0.19, 1, 0.22, 1] }}
              >
                {t("hero.titleB")}
              </motion.span>
            </span>
          </h1>
          <Reveal delay={0.42}>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mist sm:text-lg">{t("hero.sub")}</p>
          </Reveal>
          <Reveal delay={0.54} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <MagneticButton to="/assistant" className="px-7 py-3.5 text-[15px]">
              <MessageSquareHeart className="h-4.5 w-4.5" />
              {t("hero.ctaPrimary")}
            </MagneticButton>
            <MagneticButton to="/#features" variant="outline" className="px-7 py-3.5 text-[15px]">
              {t("hero.ctaSecondary")}
              <ChevronDown className="h-4 w-4" />
            </MagneticButton>
          </Reveal>
        </div>

        {/* core + floating cards */}
        <div className="relative mt-[-34px] sm:mt-[-64px]">
          <div className="pointer-events-none absolute inset-x-0 top-[58%] z-0 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgba(24,224,196,0.13),transparent)] blur-xl" />

          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="relative z-10"
          >
            <AICore className="mx-auto h-[430px] w-full max-w-[760px] sm:h-[560px]" />
          </motion.div>

          {/* desktop floaters */}
          <div className="absolute inset-0 z-20 hidden lg:block">
            <FloatCard delay={0.9} className="absolute left-[4%] top-[18%]"><AIStatusCard /></FloatCard>
            <FloatCard delay={1.1} className="absolute right-[3%] top-[26%]"><HeartCard /></FloatCard>
            <FloatCard delay={1.3} className="absolute bottom-[10%] left-[9%]"><OverviewCard /></FloatCard>
            <FloatCard delay={1.5} className="absolute bottom-[16%] right-[8%]">
              <div className="w-40">
                <div className="text-[11px] text-mist">SpO₂ · HRV</div>
                <div className="mt-1 flex items-end justify-between">
                  <span className="font-display text-2xl font-bold text-white">98<span className="text-xs text-mist">%</span></span>
                  <Sparkline data={[58, 60, 61, 59, 62, 61, 63]} />
                </div>
              </div>
            </FloatCard>
          </div>
        </div>

        {/* mobile floaters grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:hidden">
          {[
            <AIStatusCard key="a" />, <HeartCard key="h" />, <OverviewCard key="o" />,
          ].map((el, i) => (
            <Reveal key={i} delay={i * 0.1}><div className="glass rounded-2xl p-4">{el}</div></Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="flex flex-col items-center gap-1 text-[11px] tracking-[0.25em] text-mist/70 uppercase"
          >
            {t("hero.scroll")}
            <ChevronDown className="h-4 w-4 text-neon" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Ticker ----------------------------- */

function Ticker() {
  const { arr } = useLang();
  const items = arr("ticker");
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="mx-6 flex items-center gap-2.5 text-xs font-medium tracking-wide text-mist/85 whitespace-nowrap">
          <Activity className="h-3.5 w-3.5 text-neon/70" />
          {it}
          <span className="ms-6 h-1 w-1 rounded-full bg-neon/40" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative border-y border-white/[0.05] bg-white/[0.015] py-3.5 backdrop-blur-sm">
      <div className="mask-fade-x overflow-hidden">
        <div className="marquee-track flex w-max animate-marquee">
          {row("a")}{row("b")}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Stats ------------------------------ */

function Stats() {
  const { t } = useLang();
  const stats = [
    { v: 2.4, suffix: "M+", d: 1, label: t("stats.s1") },
    { v: 340, suffix: "+", d: 0, label: t("stats.s2") },
    { v: 12, suffix: "", d: 0, label: t("stats.s3") },
    { v: 2, suffix: "", d: 0, label: t("stats.s4") },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading kicker="MEDAI INDEX" title={t("stats.title")} sub={t("stats.sub")} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <TiltCard className="glass p-6 text-center">
              <Counter value={s.v} decimals={s.d} suffix={s.suffix} className="gradient-text font-display text-4xl font-bold sm:text-5xl" />
              <div className="mt-2 text-xs tracking-wide text-mist">{s.label}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Features ---------------------------- */

const FEATURE_ICONS = [MessageSquareHeart, Stethoscope, FlaskConical, PillIcon, NotebookPen, BellRing];
const FEATURE_ROUTES = ["/assistant", "/symptoms", "/labs", "/medications", "/health", "/health"];

function Features() {
  const { t } = useLang();
  const items = [1, 2, 3, 4, 5, 6].map((n) => ({
    title: t(`features.f${n}t`),
    desc: t(`features.f${n}d`),
  }));
  return (
    <section id="features" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-neon/[0.05] blur-[120px]" />
      <SectionHeading kicker={t("features.kicker")} title={t("features.title")} sub={t("features.sub")} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <Reveal key={f.title} delay={(i % 3) * 0.09} className="h-full">
              <TiltCard className="neon-frame h-full">
                <Link
                  to={FEATURE_ROUTES[i]}
                  className="glass relative z-10 flex h-full flex-col rounded-3xl p-7 transition-shadow duration-500 group-hover:shadow-[0_20px_60px_-20px_rgba(24,224,196,0.35)]"
                >
                  <div className="mb-5 inline-grid h-13 w-13 place-items-center rounded-2xl border border-neon/25 bg-gradient-to-br from-neon/15 to-azure/10 p-3.5 shadow-[inset_0_0_20px_rgba(24,224,196,0.12)]">
                    <Icon className="h-6 w-6 text-neonb transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-mist">{f.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-neonb opacity-80 transition-all duration-300 group-hover:gap-2.5 group-hover:opacity-100">
                    {t("features.explore")}
                    <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                  </span>
                </Link>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------ Safety ------------------------------ */

const SAFETY_ICONS = [TextCursorInput, Radar, ShieldCheck, Database, BrainCircuit, ScanEye, BadgeCheck];

function Safety() {
  const { t, dict, arr } = useLang();
  return (
    <section id="safety" className="relative scroll-mt-24 border-y border-white/[0.05] bg-abyss/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t("safety.kicker")} title={t("safety.title")} sub={t("safety.sub")} />

        {/* pipeline */}
        <div className="relative">
          <div className="absolute inset-x-10 top-[26px] hidden h-px bg-gradient-to-r from-transparent via-neon/40 to-transparent lg:block" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            {dict.safety.steps.map((s, i) => {
              const Icon = SAFETY_ICONS[i];
              return (
                <Reveal key={s.t} delay={i * 0.1} className="h-full">
                  <div className="group relative h-full rounded-2xl border border-white/[0.07] bg-card/70 p-4 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-neon/40 hover:shadow-[0_18px_50px_-18px_rgba(24,224,196,0.4)]">
                    <div className="relative z-10 mx-auto mb-3 grid h-[52px] w-[52px] place-items-center rounded-full border border-neon/30 bg-void shadow-[0_0_24px_-6px_rgba(24,224,196,0.55)]">
                      <Icon className="h-5 w-5 text-neonb" />
                      <span className="absolute -top-1.5 -end-1.5 grid h-5 w-5 place-items-center rounded-full bg-neon font-display text-[10px] font-bold text-[#032220]">{i + 1}</span>
                    </div>
                    <div className="font-display text-[13px] font-semibold text-white">{s.t}</div>
                    <div className="mt-1.5 text-[11px] leading-relaxed text-mist">{s.d}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* never / always */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-danger/25 bg-gradient-to-b from-danger/[0.08] to-transparent p-7">
              <h3 className="font-display text-lg font-semibold text-danger">{t("safety.never")}</h3>
              <ul className="mt-4 space-y-3">
                {arr("safety.never").length === 0 && null}
                {[t("safety.n1"), t("safety.n2"), t("safety.n3"), t("safety.n4")].map((txt) => (
                  <li key={txt} className="flex items-start gap-3 text-sm text-[#f2c9cd]">
                    <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" /> {txt}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="h-full rounded-3xl border border-success/25 bg-gradient-to-b from-success/[0.08] to-transparent p-7">
              <h3 className="font-display text-lg font-semibold text-success">{t("safety.always")}</h3>
              <ul className="mt-4 space-y-3">
                {[t("safety.a1"), t("safety.a2"), t("safety.a3"), t("safety.a4")].map((txt) => (
                  <li key={txt} className="flex items-start gap-3 text-sm text-[#c9efdd]">
                    <CheckCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" /> {txt}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- RAG ------------------------------- */

const RAG_ICONS = [BookOpenText, Cog, Slice, FingerprintPattern, Database, Search, Layers, BrainCircuit];

function Rag() {
  const { t } = useLang();
  const steps = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => t(`rag.${k}`));
  return (
    <section id="rag" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading align="start" kicker={t("rag.kicker")} title={t("rag.title")} sub={t("rag.sub")} />
          <Reveal delay={0.2}>
            <div className="-mt-4 flex items-start gap-3 rounded-2xl border border-azure/25 bg-azure/[0.06] p-4 text-[13px] leading-relaxed text-[#c6d6f5]">
              <Database className="mt-0.5 h-4.5 w-4.5 shrink-0 text-azure" />
              {t("rag.admin")}
            </div>
          </Reveal>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_60%_30%,rgba(91,140,255,0.1),transparent_65%)]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = RAG_ICONS[i];
              return (
                <Reveal key={s} delay={i * 0.07}>
                  <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-card/70 p-4 transition-all duration-500 hover:-translate-y-1 hover:border-azure/50">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azure/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <Icon className="h-5 w-5 text-[#9dbcff]" />
                    <div className="mt-3 font-display text-[13px] font-semibold leading-snug text-white">{s}</div>
                    <div className="absolute end-2 top-2 font-display text-[10px] text-white/25">{String(i + 1).padStart(2, "0")}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Deck preview --------------------------- */

function DeckPreview() {
  const { t, num, lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70, -50]);
  const rot = useTransform(scrollYProgress, [0, 0.4], reduced ? [0, 0] : [6, 0]);

  return (
    <section id="preview" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading kicker={t("preview.kicker")} title={t("preview.title")} sub={t("preview.sub")} />
      <motion.div ref={ref} style={{ y, rotateX: rot, transformPerspective: 1200 }} className="perspective-1200">
        <div className="neon-frame rounded-[2rem] shadow-[0_60px_140px_-50px_rgba(24,224,196,0.35)]">
          <div className="glass overflow-hidden rounded-[2rem]">
            {/* browser bar */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" /><span className="h-2.5 w-2.5 rounded-full bg-warn/70" /><span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              </div>
              <div className="flex-1 rounded-full border border-white/[0.06] bg-void/60 px-4 py-1 text-center text-[11px] text-mist">app.medai.health/health</div>
              <Pill tone="success">{t("common.online")}</Pill>
            </div>
            {/* mock dashboard */}
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-void/50 p-5">
                <div className="text-xs text-mist">{t("preview.score")}</div>
                <div className="mt-3 flex justify-center">
                  <RadialRing value={86} size={120}>
                    <div className="text-center">
                      <div className="font-display text-3xl font-bold text-white">{num(86)}</div>
                      <div className="text-[10px] text-success">+4 {t("preview.week")}</div>
                    </div>
                  </RadialRing>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-void/50 p-5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-mist">{t("preview.trend")}</div>
                  <Sparkline data={HR_WEEK} />
                </div>
                <LineChart data={HR_WEEK} height={120} />
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-void/50 p-5">
                <div className="text-xs text-mist">{t("dash.activity")}</div>
                <BarChart data={ACTIVITY_WEEK.slice(1, 6)} height={110} />
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-void/50 p-5">
                <div className="text-xs text-mist">{t("preview.meds")}</div>
                {["Vitamin D3", "Omega-3", "Magnesium"].map((m, i) => (
                  <div key={m} className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/90">{m}</span>
                    <Pill tone={i < 2 ? "success" : "warn"}>{i < 2 ? t("dash.taken") : t("dash.upcoming")}</Pill>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-void/50 p-5">
                <div className="text-xs text-mist">{t("preview.journal")}</div>
                <div className="mt-3 space-y-3 text-[13px]">
                  <p className="text-white/85">“{JOURNAL[0].note[lang]}”</p>
                  <p className="text-mist">{JOURNAL[1].note[lang]}</p>
                  <div className="flex gap-2">
                    <Pill tone="neon" dot={false}>{t("preview.rem")}</Pill>
                    <Pill tone="azure" dot={false}>Feb 12</Pill>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Reveal delay={0.15} className="mt-9 flex justify-center">
        <MagneticButton to="/health" variant="outline" className="px-7 py-3.5">
          {t("preview.cta")} <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
        </MagneticButton>
      </Reveal>
    </section>
  );
}

/* ------------------------------- Trust ------------------------------ */

function Trust() {
  const { t } = useLang();
  const items = [
    { icon: Stethoscope, title: t("trust.p1t"), desc: t("trust.p1d") },
    { icon: ShieldCheck, title: t("trust.p2t"), desc: t("trust.p2d") },
    { icon: BrainCircuit, title: t("trust.p3t"), desc: t("trust.p3d") },
  ];
  return (
    <section id="trust" className="scroll-mt-24 border-t border-white/[0.05] bg-abyss/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t("trust.kicker")} title={t("trust.title")} sub={t("trust.sub")} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.1}>
              <TiltCard className="glass h-full p-8 text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-neon/25 bg-neon/[0.08]">
                  <it.icon className="h-6.5 w-6.5 text-neonb" />
                </div>
                <h3 className="font-display text-xl font-semibold">{it.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{it.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA -------------------------------- */

function CtaBand() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="neon-frame relative overflow-hidden rounded-[2.2rem]">
          <div className="glass relative px-6 py-16 text-center sm:px-14">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[620px] -translate-x-1/2 rounded-full bg-neon/[0.13] blur-[90px]" />
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
            <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-5xl">
              <span className="gradient-text glow-text">{t("cta.title")}</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-mist">{t("cta.sub")}</p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton to="/assistant" className="px-8 py-4">{t("cta.primary")}</MagneticButton>
              <MagneticButton to="/health" variant="ghost" className="px-8 py-4">{t("cta.secondary")}</MagneticButton>
            </div>
            <ECGLine className="relative mx-auto mt-10 max-w-md opacity-80" height={40} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Stats />
      <Features />
      <Safety />
      <Rag />
      <DeckPreview />
      <Trust />
      <CtaBand />
    </>
  );
}
