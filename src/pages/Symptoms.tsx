import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, ClipboardList,
  Eye, HeartPulse, RotateCcw, ShieldCheck, Stethoscope, TriangleAlert,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { GlowMark, MagneticButton, Pill, Reveal } from "@/components/ui";
import { cn } from "@/utils/cn";

type LangKey = "en" | "fa";

interface Explanation { base: string[]; text: { en: string; fa: string } }

const EXPLAINERS: Explanation[] = [
  { base: ["Headache", "Fatigue"], text: { en: "Tension-type pattern — often links to stress, posture, dehydration or poor sleep.", fa: "الگوی سردرد تنشی — اغلب به استرس، وضعیت بدن، کم‌آبی یا خواب نامناسب مربوط است." } },
  { base: ["Headache"], text: { en: "Primary headache pattern — common and usually benign; context matters.", fa: "الگوی سردرد اولیه — شایع و معمولاً خوش‌خیم؛ زمینه مهم است." } },
  { base: ["Fever", "Cough"], text: { en: "Viral respiratory pattern — typical of common infections that resolve in days.", fa: "الگوی تنفسی ویروسی — معمول عفونت‌های شایعی که ظرف چند روز بهبود می‌یابند." } },
  { base: ["Sore throat", "Cough"], text: { en: "Upper-airway irritation pattern — viral or environmental (dry air, irritants).", fa: "الگوی تحریک راه هوایی فوقانی — ویروسی یا محیطی (هوای خشک، محرک‌ها)." } },
  { base: ["Nausea"], text: { en: "Stomach irritation pattern — can follow food, acid, medication or stress.", fa: "الگوی تحریک معده — می‌تواند پس از غذا، اسید، دارو یا استرس باشد." } },
  { base: ["Dizziness"], text: { en: "Circulation or hydration pattern — standing quickly, low fluids or low sugar.", fa: "الگوی گردش خون یا کم‌آبی — ایستادن ناگهانی، مایعات کم یا قند پایین." } },
  { base: ["Muscle ache", "Fatigue"], text: { en: "Post-viral or overexertion pattern — the body recovering from load or illness.", fa: "الگوی پس از بیماری ویروسی یا فشار بیش از حد — بدن در حال بازیابی." } },
  { base: ["Chest pressure", "Shortness of breath"], text: { en: "Cardio-respiratory signals — always worth prompt professional evaluation.", fa: "نشانه‌های قلبی‌تنفسی — همیشه ارزش ارزیابی فوری حرفه‌ای را دارد." } },
  { base: ["Fatigue"], text: { en: "Energy-debt pattern — sleep, stress, low iron or low vitamin D are common drivers.", fa: "الگوی کمبود انرژی — خواب، استرس، آهن پایین یا ویتامین D پایین از محرک‌های شایع‌اند." } },
];

const MONITOR: Record<string, { en: string; fa: string }> = {
  Headache: { en: "Headache timing, triggers, and any vision or speech changes", fa: "زمان سردرد، محرک‌ها و هر تغییر بینایی یا تکلم" },
  Fever: { en: "Temperature twice daily and hydration", fa: "دمای بدن دو بار در روز و میزان مایعات" },
  Cough: { en: "Cough character — dry vs. with sputum, and night worsening", fa: "نوع سرفه — خشک یا خلط‌دار، و بدتر شدن شبانه" },
  Fatigue: { en: "Sleep hours, energy through the day, caffeine timing", fa: "ساعت خواب، انرژی در طول روز، زمان مصرف کافئین" },
  "Sore throat": { en: "Swallowing pain, white patches, or fever joining", fa: "درد هنگام بلع، لکه‌های سفید یا اضافه شدن تب" },
  Nausea: { en: "Relation to meals, and vomiting frequency", fa: "ارتباط با وعده‌ها و دفعات استفراغ" },
  Dizziness: { en: "When it happens — standing, turning, exertion", fa: "زمان وقوع — هنگام ایستادن، چرخیدن، فعالیت" },
  "Muscle ache": { en: "Location, symmetry, and response to rest", fa: "محل، تقارن و پاسخ به استراحت" },
  "Shortness of breath": { en: "Breathlessness at rest vs. effort, and chest symptoms", fa: "تنگی نفس در استراحت یا هنگام تلاش، و علائم قفسه سینه" },
  "Chest pressure": { en: "Any radiation to arm/jaw, sweating, or nausea — seek urgent care if present", fa: "هرگونه انتشار به بازو/فک، تعریق یا تهوع — در صورت وجود، مراقبت فوری" },
};

const QUESTIONS: { en: string[]; fa: string[] } = {
  en: [
    "Do my symptoms fit a pattern you recognize?",
    "Which warning signs should send me back sooner?",
    "Should any of these symptoms be tested or imaged?",
    "Could my current medications be contributing?",
  ],
  fa: [
    "آیا علائم من با الگوی خاصی که می‌شناسید جور درمی‌آید؟",
    "کدام علائم هشدار باید مرا زودتر برگرداند؟",
    "آیا برای این علائم آزمایش یا تصویربرداری لازم است؟",
    "آیا داروهای فعلی من می‌توانند نقش داشته باشند؟",
  ],
};

export default function Symptoms() {
  const { t, arr, lang, dict } = useLang();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [severity, setSeverity] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [conds, setConds] = useState<number[]>([]);

  const symptomNames = arr("sym.symptomsList");
  const engNames = ["Headache", "Fever", "Cough", "Fatigue", "Sore throat", "Nausea", "Dizziness", "Muscle ache", "Shortness of breath", "Chest pressure"];

  const canNext = useMemo(() => {
    if (step === 0) return picked.length > 0;
    if (step === 1) return duration !== null && severity !== null;
    if (step === 2) return age !== null && conds.length > 0;
    return true;
  }, [step, picked, duration, severity, age, conds]);

  const result = useMemo(() => {
    const selected = picked.map((i) => engNames[i]);
    const matched = EXPLAINERS.filter((e) => e.base.every((b) => selected.includes(b)));
    const extras = EXPLAINERS.filter((e) => !matched.includes(e) && e.base.length === 1 && selected.includes(e.base[0]));
    const all = [...matched, ...extras].slice(0, 3);
    const explanations = all.length > 0 ? all : [EXPLAINERS[8]];

    const redFlag = selected.includes("Chest pressure") || selected.includes("Shortness of breath");
    let urgency: 0 | 1 | 2 = 0;
    if (redFlag) urgency = 2;
    else if (severity === 2 || (duration === 3) || (selected.includes("Fever") && (duration ?? 0) >= 2)) urgency = 1;

    const monitors = [...new Set(selected.map((s) => MONITOR[s]?.[lang]).filter(Boolean))] as string[];
    const nextStep = {
      en: [
        "Self-care with monitoring — rest, fluids, and track the items above for 48–72 hours.",
        "Book a routine appointment within a week and bring this summary.",
        "Seek prompt medical advice today — describe the symptoms exactly as logged here.",
      ],
      fa: [
        "خودمراقبتی همراه با رصد — استراحت، مایعات، و پیگیری موارد بالا به‌مدت ۴۸ تا ۷۲ ساعت.",
        "ظرف یک هفته نوبت معمولی بگیرید و این خلاصه را همراه داشته باشید.",
        "امروز با پزشک مشورت کنید — علائم را دقیقاً همان‌طور که این‌جا ثبت شده توصیف کنید.",
      ],
    }[lang][urgency];

    return { explanations, urgency, monitors, nextStep, questions: QUESTIONS[lang] };
  }, [picked, engNames, lang, severity, duration]);

  const stepsLabels = [t("sym.step1"), t("sym.step2"), t("sym.step3"), t("sym.step4"), t("sym.step5")];

  function toggle(list: number[], set: (v: number[]) => void, i: number) {
    set(list.includes(i) ? list.filter((x) => x !== i) : [...list, i]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6">
      {/* header */}
      <Reveal className="text-center">
        <span className="relative inline-grid place-items-center">
          <span className="absolute h-16 w-16 rounded-full bg-neon/15 blur-xl" />
          <Stethoscope className="relative h-9 w-9 text-neonb" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl"><span className="gradient-text">{t("sym.title")}</span></h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mist">{t("sym.sub")}</p>
      </Reveal>

      {/* stepper */}
      <div className="mt-10 mb-8">
        <div className="flex items-center justify-between">
          {stepsLabels.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={i === step ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border font-display text-xs font-bold transition-all duration-500",
                    i < step ? "border-success/60 bg-success/15 text-success"
                      : i === step ? "border-neon bg-neon/15 text-neonb shadow-[0_0_20px_-4px_rgba(24,224,196,0.7)]"
                      : "border-white/12 bg-white/[0.03] text-mist/60",
                  )}
                >
                  {i < step ? <CheckCircle2 className="h-4.5 w-4.5" /> : i + 1}
                </motion.div>
                <span className={cn("mt-1.5 hidden text-[10px] sm:block", i === step ? "text-neonb" : "text-mist/60")}>{s}</span>
              </div>
              {i < stepsLabels.length - 1 && (
                <div className="mx-2 h-px flex-1 overflow-hidden rounded bg-white/[0.08]">
                  <motion.div className="h-full bg-gradient-to-r from-neon to-neonb" initial={{ width: 0 }} animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.6 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* panels */}
      <div className="neon-frame rounded-[1.75rem]">
        <div className="glass min-h-[430px] rounded-[1.75rem] p-6 sm:p-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 34, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -34, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            >
              {step === 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold">{t("sym.pick")}</h2>
                  <p className="mt-1 text-sm text-mist">{t("sym.pickSub")}</p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {symptomNames.map((s, i) => (
                      <Chip key={s} active={picked.includes(i)} onClick={() => toggle(picked, setPicked, i)} danger={engNames[i] === "Chest pressure" || engNames[i] === "Shortness of breath"}>{s}</Chip>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <Group label={t("sym.dur")}>
                    {arr("sym.durO").map((o, i) => <Chip key={o} active={duration === i} onClick={() => setDuration(i)}>{o}</Chip>)}
                  </Group>
                  <Group label={t("sym.sev")}>
                    {arr("sym.sevL").map((o, i) => <Chip key={o} active={severity === i} onClick={() => setSeverity(i)} warn={i === 2}>{o}</Chip>)}
                  </Group>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <Group label={t("sym.age")}>
                    {arr("sym.ageO").map((o, i) => <Chip key={o} active={age === i} onClick={() => setAge(i)}>{o}</Chip>)}
                  </Group>
                  <Group label={t("sym.cond")}>
                    {arr("sym.condO").map((o, i) => (
                      <Chip key={o} active={i === 0 ? conds.length === 0 : conds.includes(i)} onClick={() => (i === 0 ? setConds([]) : toggle(conds, setConds, i))}>{o}</Chip>
                    ))}
                  </Group>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-xl font-semibold">{t("sym.rev")}</h2>
                  <p className="mt-1 text-sm text-mist">{t("sym.revSub")}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: Activity, label: t("sym.step1"), value: picked.map((i) => symptomNames[i]).join(" · ") || "—" },
                      { icon: CalendarClock, label: t("sym.dur"), value: duration !== null ? arr("sym.durO")[duration] : "—" },
                      { icon: HeartPulse, label: t("sym.sev"), value: severity !== null ? arr("sym.sevL")[severity] : "—" },
                      { icon: ClipboardList, label: t("sym.cond"), value: conds.length ? conds.map((i) => arr("sym.condO")[i]).join(" · ") : arr("sym.condO")[0] },
                    ].map((r) => (
                      <div key={r.label} className="rounded-2xl border border-white/[0.07] bg-void/50 p-4">
                        <div className="flex items-center gap-2 text-[11px] text-mist"><r.icon className="h-3.5 w-3.5 text-neon" />{r.label}</div>
                        <div className="mt-2 text-sm leading-relaxed text-white/90">{r.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold">{t("sym.result")}</h2>
                    <Pill tone={result.urgency === 2 ? "danger" : result.urgency === 1 ? "warn" : "success"}>
                      {t("sym.urgency")}: {[dict.sym.urgencyL.low, dict.sym.urgencyL.medium, dict.sym.urgencyL.high][result.urgency]}
                    </Pill>
                  </div>

                  {result.urgency === 2 && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/[0.09] p-4">
                      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                      <p className="text-sm leading-relaxed text-[#ffd9de]">{t("common.emergencyNote")}</p>
                    </div>
                  )}

                  <ResultBlock icon={Eye} title={t("sym.possible")}>
                    <div className="space-y-2.5">
                      {result.explanations.map((e, i) => (
                        <div key={i} className="rounded-xl border border-white/[0.06] bg-void/50 p-3.5 text-sm leading-relaxed text-white/85">
                          {e.text[lang as LangKey]}
                        </div>
                      ))}
                    </div>
                  </ResultBlock>

                  <ResultBlock icon={Activity} title={t("sym.monitor")}>
                    <ul className="space-y-2">
                      {result.monitors.map((m, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-white/85">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-azure" />{m}
                        </li>
                      ))}
                    </ul>
                  </ResultBlock>

                  <ResultBlock icon={ArrowRight} title={t("sym.next")}>
                    <div className="rounded-xl border border-neon/25 bg-neon/[0.07] p-4 text-sm font-medium leading-relaxed text-neonb">
                      {result.nextStep}
                    </div>
                  </ResultBlock>

                  <ResultBlock icon={Stethoscope} title={t("sym.questions")}>
                    <ol className="space-y-2">
                      {result.questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-white/85">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-azure/15 font-display text-[10px] font-bold text-[#9dbcff]">{i + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ol>
                  </ResultBlock>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-warn/25 bg-warn/[0.06] p-4 text-[13px] leading-relaxed text-warn/90">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {t("sym.disclaimer")}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* nav */}
      <div className="mt-7 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-mist transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {t("common.back")}
          </button>
        ) : <span />}

        {step < 3 && (
          <MagneticButton onClick={() => canNext && setStep((s) => s + 1)} className={cn(!canNext && "pointer-events-none opacity-40")}>
            {t("common.next")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </MagneticButton>
        )}
        {step === 3 && (
          <MagneticButton onClick={() => setStep(4)}>
            <GlowMark size={18} /> {t("sym.analyze")}
          </MagneticButton>
        )}
        {step === 4 && (
          <MagneticButton variant="outline" onClick={() => { setStep(0); setPicked([]); setDuration(null); setSeverity(null); setAge(null); setConds([]); }}>
            <RotateCcw className="h-4 w-4" /> {t("sym.restart")}
          </MagneticButton>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-mist/70">
        <ShieldCheck className="h-3.5 w-3.5 text-neon/70" />
        {t("common.notDoctor")}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick, danger, warn }: {
  children: React.ReactNode; active: boolean; onClick: () => void; danger?: boolean; warn?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4.5 py-2.5 text-sm transition-all duration-300",
        active
          ? danger ? "border-danger bg-danger/15 text-[#ffb9c0] shadow-[0_0_20px_-4px_rgba(255,77,95,0.5)]"
            : warn ? "border-warn bg-warn/15 text-warn shadow-[0_0_20px_-4px_rgba(255,181,71,0.5)]"
            : "border-neon bg-neon/15 text-neonb shadow-[0_0_20px_-4px_rgba(24,224,196,0.5)]"
          : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </motion.button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-base font-semibold text-white/95">{label}</h3>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

function ResultBlock({ icon: Icon, title, children }: { icon: typeof Eye; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold tracking-wide text-white/90">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-neon/25 bg-neon/[0.08]"><Icon className="h-3.5 w-3.5 text-neonb rtl:-scale-x-100" /></span>
        {title}
      </h3>
      {children}
    </div>
  );
}
