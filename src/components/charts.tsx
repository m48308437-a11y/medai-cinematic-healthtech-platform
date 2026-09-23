import { motion } from "framer-motion";
import { useId } from "react";

/* Animated SVG chart primitives — no external chart lib, GPU-friendly. */

function smoothPath(data: number[], w: number, h: number, pad = 4): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    h - pad - ((v - min) / rng) * (h - pad * 2),
  ]);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

export function LineChart({ data, compare, color = "#18e0c4", height = 180, labels }: {
  data: number[]; compare?: number[]; color?: string; height?: number; labels?: string[];
}) {
  const id = useId();
  const w = 560;
  const path = smoothPath(data, w, height, 8);
  const area = `${path} L ${w - 8},${height} L 8,${height} Z`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full overflow-visible" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-g`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1="8" x2={w - 8} y1={height * p} y2={height * p} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 6" />
        ))}
        {compare && (
          <path d={smoothPath(compare, w, height, 8)} fill="none" stroke="#5b8cff" strokeOpacity="0.45" strokeWidth="1.6" strokeDasharray="1 7" strokeLinecap="round" />
        )}
        <motion.path
          d={area}
          fill={`url(#${id}-a)`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          filter={`url(#${id}-g)`}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
        />
        <circle
          cx={w - 8} cy={height - 8 - ((data[data.length - 1] - Math.min(...data)) / ((Math.max(...data) - Math.min(...data)) || 1)) * (height - 16)}
          r="4" fill={color}
        >
          <animate attributeName="r" values="3.4;5;3.4" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.55;1" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>
      {labels && (
        <div className="mt-2 flex justify-between text-[10px] tracking-wide text-mist/70">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

export function RadialRing({ value, size = 148, stroke = 11, color = "#18e0c4", children }: {
  value: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode;
}) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2ffff0" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${id}-r)`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
          style={{ filter: "drop-shadow(0 0 8px rgba(24,224,196,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function BarChart({ data, color = "#18e0c4", height = 150, labels }: {
  data: number[]; color?: string; height?: number; labels?: string[];
}) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="flex items-end gap-2.5" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="group relative flex-1">
            <motion.div
              className="w-full rounded-t-md"
              style={{ background: `linear-gradient(180deg, ${color}, ${color}22)`, boxShadow: `0 0 18px -6px ${color}66` }}
              initial={{ height: 0 }}
              whileInView={{ height: `${(v / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: [0.19, 1, 0.22, 1] }}
            />
            <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-abyss px-1.5 py-0.5 text-[9px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              {v.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex gap-2.5 text-[10px] text-mist/70">
          {labels.map((l, i) => <span key={i} className="flex-1 text-center">{l}</span>)}
        </div>
      )}
    </div>
  );
}

export function Sparkline({ data, color = "#2ffff0", height = 34 }: { data: number[]; color?: string; height?: number }) {
  const w = 110;
  const path = smoothPath(data, w, height, 3);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width={w} height={height} className="overflow-visible">
      <motion.path
        d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 5px ${color}88)` }}
      />
    </svg>
  );
}

/** Lab range bar: low ⎯⎯⎯⎯ high with marker showing value position. */
export function RangeBar({ value, low, high }: { value: number; low: number; high: number }) {
  const span = high - low;
  const domLow = low - span * 0.45;
  const domHigh = high + span * 0.45;
  const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
  const x = ((clamp(value, domLow, domHigh) - domLow) / (domHigh - domLow)) * 100;
  const lo = ((low - domLow) / (domHigh - domLow)) * 100;
  const hi = ((high - domLow) / (domHigh - domLow)) * 100;
  const ok = value >= low && value <= high;
  const border = !ok && Math.min(Math.abs(value - low), Math.abs(value - high)) <= span * 0.18;
  const color = ok ? "#32d583" : border ? "#ffb547" : "#ff4d5f";
  return (
    <div className="relative h-2 w-full rounded-full bg-white/[0.06]">
      <div
        className="absolute inset-y-0 rounded-full"
        style={{ left: `${lo}%`, width: `${hi - lo}%`, background: "linear-gradient(90deg, rgba(50,213,131,0.25), rgba(24,224,196,0.45), rgba(50,213,131,0.25))" }}
      />
      <div className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${lo}%` }} />
      <div className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${hi}%` }} />
      <motion.div
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2"
        style={{ borderColor: color, background: "#030609", boxShadow: `0 0 14px ${color}` }}
        initial={{ left: "0%" }}
        whileInView={{ left: `calc(${x}% - 8px)` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
      />
    </div>
  );
}
