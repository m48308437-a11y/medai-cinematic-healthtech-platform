import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/utils/cn";

/* ------------------------------ Logo ------------------------------ */

export function GlowMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <radialGradient id="gm-g" cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#2ffff0" />
          <stop offset="55%" stopColor="#18e0c4" />
          <stop offset="100%" stopColor="#052a28" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="19" fill="url(#gm-g)" />
      <circle cx="32" cy="32" r="26.5" stroke="#18e0c4" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="6 5" />
      <path d="M22 32h6l2.6-6 4 12 2.6-6H42" stroke="#030609" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------- Background FX ------------------------- */

export function BackgroundFX() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX - 300);
      my.set(e.clientY - 300);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduced]);

  const stars = useRef(
    Array.from({ length: 70 }, () => ({
      l: Math.random() * 100, t: Math.random() * 100,
      s: Math.random() * 1.8 + 0.6, d: Math.random() * 4, o: Math.random() * 0.5 + 0.15,
    })),
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      {/* aurora blobs */}
      <div className="absolute -top-[22%] left-[8%] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(24,224,196,0.14),transparent_65%)] blur-2xl animate-aurora" />
      <div className="absolute top-[30%] right-[-12%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(91,140,255,0.12),transparent_65%)] blur-2xl animate-aurora [animation-delay:-9s]" />
      <div className="absolute bottom-[-25%] left-[22%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(47,255,240,0.08),transparent_65%)] blur-2xl animate-aurora [animation-delay:-17s]" />
      {/* grid */}
      <div className="absolute inset-0 grid-bg" />
      {/* stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.l}%`, top: `${s.t}%`, width: s.s, height: s.s, opacity: s.o, animationDelay: `${s.d}s` }}
        />
      ))}
      {/* light beams */}
      {!reduced && (
        <>
          <div className="absolute left-[18%] top-[-10%] h-[130%] w-24 rotate-12 bg-gradient-to-b from-neon/[0.05] via-transparent to-transparent blur-md animate-beam" />
          <div className="absolute right-[24%] top-[-10%] h-[130%] w-16 rotate-12 bg-gradient-to-b from-azure/[0.06] via-transparent to-transparent blur-md animate-beam [animation-delay:-3.5s]" />
        </>
      )}
      {/* pointer glow */}
      {!reduced && (
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full"
          style={{
            x: sx, y: sy,
            background: "radial-gradient(circle, rgba(24,224,196,0.07), transparent 62%)",
            mixBlendMode: "screen",
          }}
        />
      )}
      {/* noise */}
      <div className="absolute inset-0 noise" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,transparent_55%,rgba(3,6,9,0.75))]" />
    </div>
  );
}

/* --------------------------- Magnetic button ----------------------- */

type MBtnProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "danger";
  className?: string;
  type?: "button" | "submit";
};

export function MagneticButton({ children, to, onClick, variant = "primary", className, type = "button" }: MBtnProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 });
  const reduced = useReducedMotion();

  const styles = {
    primary:
      "bg-gradient-to-r from-neon to-neonb text-[#032220] font-semibold shadow-[0_10px_40px_-10px_rgba(24,224,196,0.65)] hover:shadow-[0_14px_54px_-8px_rgba(47,255,240,0.75)]",
    ghost: "glass text-white hover:border-neon/40 hover:bg-white/[0.06]",
    outline:
      "border border-neon/30 text-neonb bg-neon/[0.06] hover:bg-neon/[0.14] hover:border-neon/60 shadow-[inset_0_0_24px_rgba(24,224,196,0.08)]",
    danger: "border border-danger/40 text-danger bg-danger/[0.08] hover:bg-danger/[0.16]",
  }[variant];

  const inner = (
    <motion.span style={{ x: sx, y: sy }} className="relative z-10 inline-flex items-center gap-2">
      {children}
    </motion.span>
  );

  const handlers = {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (reduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - r.left - r.width / 2) * 0.22);
      y.set((e.clientY - r.top - r.height / 2) * 0.35);
    },
    onPointerLeave: () => {
      x.set(0); y.set(0);
    },
  };

  const cls = cn(
    "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm transition-all duration-300 will-change-transform",
    styles,
    className,
  );

  const shine = (
    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...handlers}>
        {shine}
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} {...handlers}>
      {shine}
      {inner}
    </button>
  );
}

/* ------------------------------ Tilt card -------------------------- */

export function TiltCard({ children, className, intensity = 9 }: { children: ReactNode; className?: string; intensity?: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 16 });
  const sry = useSpring(ry, { stiffness: 180, damping: 16 });
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("perspective-1200 group relative rounded-3xl will-change-transform", className)}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * intensity);
        rx.set(-(py - 0.5) * intensity);
        e.currentTarget.style.setProperty("--mx", `${px * 100}%`);
        e.currentTarget.style.setProperty("--my", `${py * 100}%`);
      }}
      onPointerLeave={() => {
        rx.set(0); ry.set(0);
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(280px circle at var(--mx,50%) var(--my,50%), rgba(47,255,240,0.12), transparent 65%)" }}
      />
      {children}
    </motion.div>
  );
}

/* ------------------------------ Reveal ----------------------------- */

export function Reveal({ children, delay = 0, y = 30, className, once = true, blur = true }: {
  children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean; blur?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------- Section heading ----------------------- */

export function SectionHeading({ kicker, title, sub, align = "center" }: {
  kicker: string; title: string; sub?: string; align?: "center" | "start";
}) {
  return (
    <div className={cn("mb-14 flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start text-start")}>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/[0.07] px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] text-neonb uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-neonb animate-pulse-dot" />
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="max-w-3xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="max-w-2xl text-base leading-relaxed text-mist">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------ Counter ---------------------------- */

export function Counter({ value, suffix = "", decimals = 0, className }: {
  value: number; suffix?: string; decimals?: number; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { num } = useLang();

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.19, 1, 0.22, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = num(Number(v.toFixed(decimals))) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix, decimals, num]);

  return <span ref={ref} className={className}>{num(0)}{suffix}</span>;
}

/* ------------------------------ ECG line --------------------------- */

export function ECGLine({ className, height = 46 }: { className?: string; height?: number }) {
  const d =
    "M0,26 H52 l5,-7 5,14 6,-30 6,42 5,-19 h10 l4,-5 6,5 H180 l5,-7 5,14 6,-30 6,42 5,-19 h10 l4,-5 6,5 H320 l5,-7 5,14 6,-30 6,42 5,-19 h10 l4,-5 6,5 H460 l5,-7 5,14 6,-30 6,42 5,-19 h10 l4,-5 6,5 H600";
  return (
    <svg viewBox="0 0 600 52" preserveAspectRatio="none" className={cn("w-full", className)} style={{ height }} aria-hidden>
      <path d={d} fill="none" stroke="rgba(24,224,196,0.15)" strokeWidth="1.4" />
      <path
        d={d} fill="none" stroke="url(#ecg-s)" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="150 690" className="animate-ecg"
        style={{ filter: "drop-shadow(0 0 6px rgba(47,255,240,0.8))" }}
      />
      <defs>
        <linearGradient id="ecg-s" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2ffff0" />
          <stop offset="100%" stopColor="#18e0c4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------------------------- Status pill -------------------------- */

const TONES = {
  neon: "border-neon/30 bg-neon/10 text-neonb",
  azure: "border-azure/30 bg-azure/10 text-[#9dbcff]",
  success: "border-success/30 bg-success/10 text-success",
  warn: "border-warn/30 bg-warn/10 text-warn",
  danger: "border-danger/30 bg-danger/10 text-danger",
  dim: "border-white/10 bg-white/5 text-mist",
} as const;

export function Pill({ tone = "neon", children, dot = true, className }: {
  tone?: keyof typeof TONES; children: ReactNode; dot?: boolean; className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium", TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />}
      {children}
    </span>
  );
}

/* --------------------------- Markdown lite ------------------------- */

export function MarkdownLite({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-[#dbe7ec]", className)}>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter(Boolean);
        const isList = lines.every((l) => l.trim().startsWith("- "));
        if (isList) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neon/80 shadow-[0_0_8px_rgba(24,224,196,0.8)]" />
                  <span>{renderInline(l.replace(/^\s*-\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{lines.map((l, j) => <span key={j}>{renderInline(l)}{j < lines.length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>,
  );
}
