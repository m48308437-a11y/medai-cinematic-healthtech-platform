import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, ArrowUpDown, Ban, BarChart3, Bell, BookOpen, BrainCircuit, CheckCircle2, CircleAlert,
  Cpu, Database, FileText, Gauge, LayoutDashboard, Megaphone, RefreshCw, ScrollText, Search,
  Server, Settings, ShieldAlert, ShieldCheck, Trash2, TriangleAlert, Upload, UserCog, Users, Zap,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import {
  ADMIN_GROWTH, ADMIN_LATENCY, ADMIN_USAGE, ADMIN_USERS, AUDIT_LOGS, KNOWLEDGE_DOCS, NOTIFS, SAFETY_EVENTS,
} from "@/data/demo";
import type { AdminUser } from "@/data/demo";
import { BarChart, LineChart, RadialRing } from "@/components/charts";
import { Counter, Pill, Reveal } from "@/components/ui";
import { cn } from "@/utils/cn";

type SectionId = "overview" | "analytics" | "users" | "ai" | "safety" | "knowledge" | "content" | "notif" | "team" | "audit" | "settings";

const SECTIONS: { id: SectionId; icon: typeof LayoutDashboard; key: string }[] = [
  { id: "overview", icon: LayoutDashboard, key: "admin.overview" },
  { id: "analytics", icon: BarChart3, key: "admin.analytics" },
  { id: "users", icon: Users, key: "admin.users" },
  { id: "ai", icon: BrainCircuit, key: "admin.ai" },
  { id: "safety", icon: ShieldAlert, key: "admin.safetyC" },
  { id: "knowledge", icon: BookOpen, key: "admin.knowledge" },
  { id: "content", icon: FileText, key: "admin.content" },
  { id: "notif", icon: Bell, key: "admin.notif" },
  { id: "team", icon: UserCog, key: "admin.team" },
  { id: "audit", icon: ScrollText, key: "admin.audit" },
  { id: "settings", icon: Settings, key: "admin.settings" },
];

const SEV_TONES = ["danger", "warn", "azure", "dim"] as const;

export default function Admin() {
  const { t, num, lang, arr } = useLang();
  const [section, setSection] = useState<SectionId>("overview");
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [events, setEvents] = useState(SAFETY_EVENTS);
  const [docs, setDocs] = useState(KNOWLEDGE_DOCS);
  const [userQ, setUserQ] = useState("");
  const [roleF, setRoleF] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"name" | "joined">("joined");
  const [sortAsc, setSortAsc] = useState(false);
  const [reindexing, setReindexing] = useState<number | null>(null);
  const [readNotifs, setReadNotifs] = useState<number[]>([]);
  const [toggles, setToggles] = useState<boolean[]>([false, true, true, true, true, false]);

  useEffect(() => {
    document.title = "MEDAI — Admin (noindex)";
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = "MEDAI — Your Health. Reimagined.";
      meta?.setAttribute("content", "index, follow");
    };
  }, []);

  const filteredUsers = useMemo(() => {
    let list = users.filter(
      (u) => (!userQ || (u.name + u.email).toLowerCase().includes(userQ.toLowerCase())) && (!roleF || u.role === roleF),
    );
    list = [...list].sort((a, b) => {
      const c = sortKey === "name" ? a.name.localeCompare(b.name) : a.joined.localeCompare(b.joined);
      return sortAsc ? c : -c;
    });
    return list;
  }, [users, userQ, roleF, sortKey, sortAsc]);

  function reindex(id: number) {
    setReindexing(id);
    setDocs((ds) => ds.map((d) => (d.id === id ? { ...d, status: "Updating" } : d)));
    setTimeout(() => {
      setDocs((ds) => ds.map((d) => {
        if (d.id !== id) return d;
        const m = /v(\d+)\.(\d+)/.exec(d.ver);
        const ver = m ? `v${m[1]}.${Number(m[2]) + 1}` : d.ver;
        return { ...d, status: "Indexed", ver };
      }));
      setReindexing(null);
    }, 2400);
  }

  const sevCounts = [0, 1, 2, 3].map((s) => events.filter((e) => e.sev === s).length);

  return (
    <div className="mx-auto max-w-[1500px] px-4 pt-24 pb-16 sm:px-6">
      {/* header */}
      <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-neon/30 bg-neon/[0.08]"><Gauge className="h-5 w-5 text-neonb" /></span>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{t("admin.title")}</h1>
            <Pill tone="warn">{t("common.demoMode")}</Pill>
          </div>
          <p className="mt-2 text-sm text-mist">{t("admin.sub")}</p>
        </div>
        <Pill tone="success">All systems operational · 99.98%</Pill>
      </Reveal>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* sidebar */}
        <aside className="glass shrink-0 rounded-3xl p-3 lg:sticky lg:top-24 lg:w-60 lg:self-start">
          <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-300 lg:w-full",
                  section === s.id
                    ? "border border-neon/35 bg-neon/[0.1] text-neonb shadow-[0_8px_28px_-12px_rgba(24,224,196,0.6)]"
                    : "border border-transparent text-mist hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{t(s.key)}</span>
                {s.id === "safety" && sevCounts[0] + sevCounts[1] > 0 && (
                  <span className="ms-auto grid h-4.5 min-w-4.5 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                    {num(sevCounts[0] + sevCounts[1])}
                  </span>
                )}
                {s.id === "notif" && NOTIFS.filter((n) => n.unread && !readNotifs.includes(n.id)).length > 0 && (
                  <span className="ms-auto h-1.5 w-1.5 rounded-full bg-neonb" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* content */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={section + lang}
              initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            >
              {section === "overview" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {[
                      { icon: Users, label: t("admin.usersStat"), v: 48210, tone: "text-neonb" },
                      { icon: Activity, label: t("admin.activeUsers"), v: 3124, tone: "text-success" },
                      { icon: Zap, label: t("admin.aiReq"), v: 96400, tone: "text-[#9dbcff]" },
                      { icon: BrainCircuit, label: t("admin.consults"), v: 12840, tone: "text-neonb" },
                      { icon: ShieldAlert, label: t("admin.safetyEv"), v: 6, tone: "text-warn" },
                      { icon: Server, label: t("admin.status"), v: 99.98, suffix: "%", dec: 2, tone: "text-success" },
                    ].map((s, i) => (
                      <Reveal key={s.label} delay={i * 0.05}>
                        <div className="glass rounded-2xl p-5 transition-all hover:border-neon/25">
                          <s.icon className={cn("h-5 w-5", s.tone)} />
                          <div className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                            <Counter value={s.v} suffix={s.suffix ?? ""} decimals={s.dec ?? 0} />
                          </div>
                          <div className="mt-1 text-[11px] text-mist">{s.label}</div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                  <div className="glass rounded-3xl p-6">
                    <h3 className="font-display text-sm font-semibold text-white">{t("admin.status")}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-5">
                      {[t("admin.svc.api"), t("admin.svc.ai"), t("admin.svc.db"), t("admin.svc.vec"), t("admin.svc.queue")].map((s) => (
                        <div key={s} className="rounded-xl border border-white/[0.06] bg-void/50 p-3.5 text-center">
                          <span className="mx-auto mb-2 block h-2.5 w-2.5 rounded-full bg-success animate-pulse-dot" />
                          <div className="text-[11px] font-medium text-white/85">{s}</div>
                          <div className="text-[9px] text-success">OK</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="glass rounded-3xl p-6">
                      <h3 className="font-display text-sm font-semibold text-white">{t("admin.growth")} <span className="text-[10px] font-normal text-mist">· {t("admin.month")}</span></h3>
                      <LineChart data={ADMIN_GROWTH} height={170} />
                    </div>
                    <div className="glass rounded-3xl p-6">
                      <h3 className="font-display text-sm font-semibold text-white">{t("admin.usage")} <span className="text-[10px] font-normal text-mist">· {t("admin.week")}</span></h3>
                      <BarChart data={ADMIN_USAGE} height={170} color="#5b8cff" labels={["S", "S", "M", "T", "W", "T", "F"]} />
                    </div>
                  </div>
                </div>
              )}

              {section === "analytics" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <ChartCard title={t("admin.growth")}><LineChart data={ADMIN_GROWTH} height={190} /></ChartCard>
                  <ChartCard title={t("admin.volume")}><BarChart data={[320, 480, 410, 620, 540, 780, 690]} height={190} labels={["S", "S", "M", "T", "W", "T", "F"]} /></ChartCard>
                  <ChartCard title={t("admin.latency")}><LineChart data={ADMIN_LATENCY} height={190} color="#5b8cff" /></ChartCard>
                  <ChartCard title={t("admin.errors")}>
                    <LineChart data={[2.1, 1.8, 2.4, 1.5, 1.2, 0.9, 1.1, 0.7, 0.8, 0.5, 0.6, 0.4]} height={190} color="#ff4d5f" />
                    <div className="mt-3 flex gap-2"><Pill tone="success">P50 · 124ms</Pill><Pill tone="warn">P95 · 482ms</Pill></div>
                  </ChartCard>
                  <div className="glass rounded-3xl p-6 md:col-span-2">
                    <h3 className="font-display text-sm font-semibold text-white">{t("admin.safetyEv")}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      {arr("admin.sevLevels").map((s, i) => (
                        <div key={s} className="rounded-xl border border-white/[0.06] bg-void/50 p-4 text-center">
                          <div className={cn("font-display text-2xl font-bold", SEV_TONES[i] === "danger" ? "text-danger" : SEV_TONES[i] === "warn" ? "text-warn" : SEV_TONES[i] === "azure" ? "text-[#9dbcff]" : "text-mist")}>
                            {num(sevCounts[i])}
                          </div>
                          <Pill tone={SEV_TONES[i]} className="mt-2">{s}</Pill>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {section === "users" && (
                <div className="glass rounded-3xl p-6">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <div className="relative min-w-52 flex-1">
                      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
                      <input value={userQ} onChange={(e) => setUserQ(e.target.value)} placeholder={t("admin.searchUsers")}
                        className="w-full rounded-xl border border-white/[0.08] bg-void/60 py-2.5 ps-9 pe-3 text-sm text-white outline-none focus:border-neon/40" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {["super", "admin", "medical", "support", "analyst"].map((r) => (
                        <button key={r} onClick={() => setRoleF(roleF === r ? null : r)}
                          className={cn("rounded-full border px-3 py-1.5 text-[11px] capitalize transition-all",
                            roleF === r ? "border-neon bg-neon/15 text-neonb" : "border-white/10 text-mist hover:text-white")}>
                          {t(`admin.roles.${r}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.07] text-start text-[11px] tracking-wider text-mist/70 uppercase">
                          <th className="px-3 py-3 text-start">
                            <button onClick={() => { setSortKey("name"); setSortAsc((v) => sortKey !== "name" ? true : !v); }} className="flex items-center gap-1 hover:text-neonb">
                              {t("admin.users")} <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </th>
                          <th className="px-3 py-3 text-start">{t("admin.role")}</th>
                          <th className="px-3 py-3 text-start">{t("admin.plan")}</th>
                          <th className="px-3 py-3 text-start">
                            <button onClick={() => { setSortKey("joined"); setSortAsc((v) => sortKey !== "joined" ? true : !v); }} className="flex items-center gap-1 hover:text-neonb">
                              {t("admin.joined")} <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </th>
                          <th className="px-3 py-3 text-start">{t("common.status")}</th>
                          <th className="px-3 py-3 text-end">{t("admin.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence initial={false}>
                          {filteredUsers.map((u) => (
                            <motion.tr
                              key={u.id}
                              layout
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }}
                              className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                            >
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neon/25 bg-neon/[0.07] font-display text-xs font-bold text-neonb">
                                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                                  </span>
                                  <span>
                                    <span className="block font-medium text-white/90">{u.name}</span>
                                    <span className="block text-[11px] text-mist" dir="ltr">{u.email}</span>
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3"><Pill tone={u.role === "super" ? "danger" : u.role === "admin" ? "azure" : "dim"} dot={false}>{t(`admin.roles.${u.role}`)}</Pill></td>
                              <td className="px-3 py-3 text-mist">{u.plan}</td>
                              <td className="px-3 py-3 text-mist" dir="ltr">{u.joined}</td>
                              <td className="px-3 py-3">
                                <Pill tone={u.status === "active" ? "success" : "warn"}>{u.status === "active" ? t("admin.active") : t("admin.suspended")}</Pill>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex justify-end gap-1.5">
                                  <IconBtn title={u.status === "active" ? t("admin.suspend") : t("admin.restore")}
                                    onClick={() => setUsers((us) => us.map((x) => x.id === u.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x))}
                                    tone={u.status === "active" ? "warn" : "success"}>
                                    {u.status === "active" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                  </IconBtn>
                                  <IconBtn title={t("common.delete")} onClick={() => setUsers((us) => us.filter((x) => x.id !== u.id))} tone="danger">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </IconBtn>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && <p className="py-10 text-center text-sm text-mist">—</p>}
                  </div>
                </div>
              )}

              {section === "ai" && (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="neon-frame rounded-3xl md:col-span-1">
                      <div className="glass h-full rounded-3xl p-6 text-center">
                        <BrainCircuit className="mx-auto h-8 w-8 text-neonb" />
                        <div className="mt-3 text-[11px] tracking-wider text-mist uppercase">{t("admin.model")}</div>
                        <div className="mt-1 font-display text-xl font-bold text-white">medai-reason-v3</div>
                        <div className="mt-2 flex justify-center gap-2">
                          <Pill tone="neon">{t("admin.provider")}: OpenAI</Pill>
                        </div>
                        <p className="mt-3 text-[11px] leading-relaxed text-mist">Swappable provider layer — set <code className="text-neonb" dir="ltr">AI_PROVIDER</code> in env.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                      {[
                        { label: t("admin.requests"), v: "96,400", icon: Zap },
                        { label: t("admin.latencyMs"), v: "139 ms", icon: Gauge },
                        { label: t("admin.tokens"), v: "12.4M / 24h", icon: Cpu },
                        { label: t("admin.ragStatus"), v: "Healthy", icon: Database },
                      ].map((k) => (
                        <div key={k.label} className="glass rounded-2xl p-5">
                          <k.icon className="h-4.5 w-4.5 text-neonb" />
                          <div className="mt-3 font-display text-xl font-bold text-white" dir="ltr">{k.v}</div>
                          <div className="text-[11px] text-mist">{k.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
                    <div className="flex items-center gap-4">
                      <RadialRing value={94} size={84} stroke={8}><span className="font-display text-sm font-bold text-white">94%</span></RadialRing>
                      <div>
                        <div className="font-display text-base font-semibold text-white">{t("admin.ragStatus")}</div>
                        <div className="text-xs text-mist" dir="ltr">20,775 {t("admin.indexed")} · last sync 08:41</div>
                      </div>
                    </div>
                    <div className="flex gap-6 text-center">
                      {[["384", "ms retrieve"], ["2.1M", "vectors"], ["340+", "sources"]].map(([v, l]) => (
                        <div key={l}>
                          <div className="font-display text-lg font-bold text-neonb" dir="ltr">{v}</div>
                          <div className="text-[10px] text-mist" dir="ltr">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-3xl p-6">
                    <h3 className="mb-3 font-display text-sm font-semibold text-white">{t("admin.latency")}</h3>
                    <LineChart data={ADMIN_LATENCY} height={150} color="#5b8cff" />
                  </div>
                </div>
              )}

              {section === "safety" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-4">
                    {arr("admin.sevLevels").map((s, i) => (
                      <div key={s} className={cn("glass rounded-2xl border-t-2 p-5", SEV_TONES[i] === "danger" ? "border-t-danger" : SEV_TONES[i] === "warn" ? "border-t-warn" : SEV_TONES[i] === "azure" ? "border-t-azure" : "border-t-white/20")}>
                        <div className="font-display text-2xl font-bold text-white">{num(sevCounts[i])}</div>
                        <Pill tone={SEV_TONES[i]} className="mt-2">{s}</Pill>
                      </div>
                    ))}
                  </div>
                  <div className="glass rounded-3xl p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-display text-sm font-semibold text-white">{t("admin.history")}</h3>
                      <Pill tone="success" dot>{t("admin.resolution")}: {num(events.filter((e) => e.resolved).length)}/{num(events.length)}</Pill>
                    </div>
                    <div className="space-y-2.5">
                      {events.map((e) => (
                        <motion.div
                          key={e.id}
                          layout
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-void/40 px-4 py-3.5"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            {e.sev === 0 ? <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" />
                              : e.sev === 1 ? <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warn" />
                              : <CircleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#9dbcff]" />}
                            <div className="min-w-0">
                              <div className="text-sm text-white/90">{e.title[lang]}</div>
                              <div className="mt-0.5 text-[11px] text-mist">{e.time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Pill tone={SEV_TONES[e.sev]}>{arr("admin.sevLevels")[e.sev]}</Pill>
                            {e.resolved ? (
                              <Pill tone="success"><CheckCircle2 className="h-3 w-3" />{t("admin.resolved")}</Pill>
                            ) : (
                              <button
                                onClick={() => setEvents((es) => es.map((x) => (x.id === e.id ? { ...x, resolved: true } : x)))}
                                className="rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-[11px] text-neonb transition-all hover:bg-neon/20"
                              >
                                {t("admin.resolve")}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {section === "knowledge" && (
                <div className="glass rounded-3xl p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-sm font-semibold text-white">{t("admin.sources")} · {t("admin.documents")}</h3>
                    <button className="flex items-center gap-2 rounded-full border border-dashed border-neon/40 bg-neon/[0.06] px-4 py-2 text-xs text-neonb transition-all hover:bg-neon/[0.12]">
                      <Upload className="h-3.5 w-3.5" /> {t("admin.uploadDoc")}
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {docs.map((d) => (
                      <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-void/40 px-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-azure/30 bg-azure/[0.08]"><Database className="h-4.5 w-4.5 text-[#9dbcff]" /></span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white/90">{d.name}</div>
                            <div className="text-[11px] text-mist" dir="ltr">{d.src} · {num(d.chunks)} chunks · {d.ver}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Pill tone={d.status === "Indexed" ? "success" : "warn"}>{d.status}</Pill>
                          <button
                            onClick={() => reindex(d.id)}
                            disabled={reindexing !== null}
                            className="flex items-center gap-1.5 rounded-full border border-neon/35 bg-neon/10 px-3.5 py-1.5 text-[11px] text-neonb transition-all hover:bg-neon/20 disabled:opacity-40"
                          >
                            <RefreshCw className={cn("h-3.5 w-3.5", reindexing === d.id && "animate-spin")} />
                            {reindexing === d.id ? t("admin.reindexing") : t("admin.reindex")}
                          </button>
                          <IconBtn title={t("common.delete")} onClick={() => setDocs((ds) => ds.filter((x) => x.id !== d.id))} tone="danger">
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                        {reindexing === d.id && (
                          <div className="w-full">
                            <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full w-2/3 shimmer-line rounded-full" /></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section === "content" && (
                <div className="grid gap-5 sm:grid-cols-3">
                  {[
                    { n: 128, label: t("admin.articles"), icon: FileText },
                    { n: 342, label: t("admin.faqs"), icon: BrainCircuit },
                    { n: 64, label: t("admin.guides"), icon: BookOpen },
                  ].map((c) => (
                    <div key={c.label} className="glass rounded-3xl p-6 text-center transition-all hover:border-neon/25">
                      <c.icon className="mx-auto h-6 w-6 text-neonb" />
                      <div className="mt-3 font-display text-3xl font-bold text-white"><Counter value={c.n} /></div>
                      <div className="mt-1 text-xs text-mist">{c.label}</div>
                      <button className="mt-4 w-full rounded-xl border border-white/10 py-2 text-xs text-mist transition-all hover:border-neon/40 hover:text-neonb">+ {t("common.add")}</button>
                    </div>
                  ))}
                </div>
              )}

              {section === "notif" && (
                <div className="space-y-5">
                  <div className="glass rounded-3xl p-6">
                    <h3 className="font-display text-sm font-semibold text-white">{t("admin.notifTitle")}</h3>
                    <p className="mt-1 text-xs text-mist">{t("admin.notifSub")}</p>
                    <div className="mt-4 flex gap-2">
                      <input placeholder="…" className="flex-1 rounded-xl border border-white/[0.08] bg-void/60 px-4 py-2.5 text-sm text-white outline-none focus:border-neon/40" />
                      <button className="flex items-center gap-2 rounded-xl bg-neon px-5 text-sm font-semibold text-[#032220] transition-all hover:brightness-110">
                        <Megaphone className="h-4 w-4" /> {t("admin.send")}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {NOTIFS.map((n) => {
                      const read = !n.unread || readNotifs.includes(n.id);
                      return (
                        <button
                          key={n.id}
                          onClick={() => setReadNotifs((r) => [...r, n.id])}
                          className={cn("glass flex w-full items-start gap-3 rounded-2xl px-5 py-4 text-start transition-all", !read && "border-neon/30 bg-neon/[0.05]")}
                        >
                          <Bell className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", read ? "text-mist/50" : "text-neonb")} />
                          <span className="min-w-0 flex-1">
                            <span className={cn("block text-sm", read ? "text-mist" : "font-medium text-white")}>{n.title[lang]}</span>
                            <span className="mt-0.5 block text-xs text-mist/80">{n.body[lang]}</span>
                          </span>
                          <span className="shrink-0 text-[10px] text-mist/60">{n.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {section === "team" && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(["super", "admin", "medical", "support", "analyst"] as const).map((r, i) => {
                    const perms = [
                      ["All permissions · Audit override · Billing", "User & system management · Safety review", "Roles & team administration"],
                      ["User management · Safety review · Content", "Knowledge re-index · Broadcasts", "No billing access"],
                      ["Medical sources & documents · Content publish", "FAQs, articles, guides", "Read-only analytics"],
                      ["Read consultations (anonymized) · Tickets", "Respond to users", "No safety overrides"],
                      ["Dashboards & exports · Read-only data", "Custom reports", "No write access"],
                    ][i];
                    return (
                      <div key={r} className={cn("glass rounded-3xl border-t-2 p-6", i === 0 ? "border-t-danger" : i === 1 ? "border-t-azure" : i === 2 ? "border-t-neon" : i === 3 ? "border-t-warn" : "border-t-success")}>
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="h-5 w-5 text-neonb" />
                          <span className="font-display text-base font-semibold text-white">{t(`admin.roles.${r}`)}</span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-mist">{num(ADMIN_USERS.filter((u) => u.role === r).length)} {t("admin.users")}</div>
                        <div className="mt-4 text-[10px] tracking-wider text-mist/60 uppercase">{t("admin.perms")}</div>
                        <ul className="mt-2 space-y-1.5">
                          {perms.map((p) => (
                            <li key={p} className="flex items-start gap-2 text-[12px] leading-relaxed text-white/80">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon" />{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {section === "audit" && (
                <div className="glass overflow-hidden rounded-3xl">
                  <div className="border-b border-white/[0.07] px-6 py-4">
                    <h3 className="font-display text-sm font-semibold text-white">{t("admin.audit")}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-[11px] tracking-wider text-mist/70 uppercase">
                          {arr("admin.auditCols").map((c) => <th key={c} className="px-5 py-3 text-start">{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {AUDIT_LOGS.map((l, i) => (
                          <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                            <td className="px-5 py-3 text-white/85" dir="ltr">{l.actor}</td>
                            <td className="px-5 py-3"><code className="rounded-md bg-neon/[0.08] px-2 py-0.5 text-[11px] text-neonb" dir="ltr">{l.action}</code></td>
                            <td className="px-5 py-3 text-mist" dir="ltr">{l.target}</td>
                            <td className="px-5 py-3 text-mist" dir="ltr">{l.time}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {section === "settings" && (
                <div className="glass max-w-2xl rounded-3xl p-6">
                  <h3 className="font-display text-sm font-semibold text-white">{t("admin.settingsTitle")}</h3>
                  <p className="mt-1.5 mb-5 text-xs text-mist">{t("admin.demo")}</p>
                  <div className="space-y-2.5">
                    {arr("admin.settItems").map((s, i) => (
                      <button
                        key={s}
                        onClick={() => setToggles((ts) => ts.map((v, j) => (j === i ? !v : v)))}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-void/40 px-4 py-3.5 text-start transition-all hover:border-white/20"
                      >
                        <span className="text-sm text-white/85">{s}</span>
                        <span className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", toggles[i] ? "bg-neon/80" : "bg-white/10")}>
                          <motion.span
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 32 }}
                            className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow", toggles[i] ? "end-[22px]" : "end-0.5", toggles[i] && "shadow-[0_0_12px_rgba(24,224,196,0.7)]")}
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="mb-3 font-display text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function IconBtn({ children, onClick, title, tone }: {
  children: React.ReactNode; onClick: () => void; title: string; tone: "warn" | "danger" | "success";
}) {
  const tones = {
    warn: "border-warn/30 text-warn hover:bg-warn/10",
    danger: "border-danger/30 text-danger hover:bg-danger/10",
    success: "border-success/30 text-success hover:bg-success/10",
  };
  return (
    <button title={title} onClick={onClick} className={cn("grid h-8 w-8 place-items-center rounded-lg border transition-all", tones[tone])}>
      {children}
    </button>
  );
}
