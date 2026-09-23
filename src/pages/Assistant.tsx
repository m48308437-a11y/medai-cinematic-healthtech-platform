import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, Copy, Check, ExternalLink, Globe, MessagesSquare, Plus, RefreshCw,
  Search, SendHorizonal, ShieldCheck, Sparkles, TriangleAlert, X,
} from "lucide-react";
import { detectMessageLang, useLang } from "@/i18n/LanguageContext";
import { getAIProvider, isDemoMode } from "@/services/ai";
import type { AISource, ChatMessage } from "@/services/ai";
import { GlowMark, MarkdownLite, Pill, TiltCard } from "@/components/ui";
import { cn } from "@/utils/cn";

interface Msg extends ChatMessage {
  id: number;
  sources?: AISource[];
  urgent?: boolean;
  streaming?: boolean;
}

interface Convo {
  id: number;
  title: string;
  lang: "en" | "fa";
  messages: Msg[];
  time: string;
}

let uid = 1;
const nid = () => uid++;

const STARTERS: Convo[] = [
  {
    id: 900, title: "Sleep questions", lang: "en", time: "Feb 5",
    messages: [
      { id: 901, role: "user", content: "How can I improve my sleep quality?" },
      { id: 902, role: "assistant", content: "**Quality sleep** is built on rhythm more than anything else.\n\nEvidence-backed habits:\n- Fixed wake-up time — even on weekends\n- Dim light and no bright screens in the last hour\n- Cool, dark, quiet bedroom\n- Caffeine curfew about 8 hours before bed", sources: [{ name: "CDC", domain: "cdc.gov" }] },
    ],
  },
];

export default function Assistant() {
  const { t, arr, lang, isFa } = useLang();
  const [convos, setConvos] = useState<Convo[]>(STARTERS);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const provider = useMemo(() => getAIProvider(), []);

  const active = convos.find((c) => c.id === activeId) ?? null;
  const suggestions = arr("ai.sugg");

  const filtered = convos.filter((c) =>
    !query || c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(query.toLowerCase())),
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight + 400;
  }, [active?.messages.length, active?.messages[active.messages.length - 1]?.content]);

  async function runStream(convoId: number, history: ChatMessage[], answerLang: "en" | "fa") {
    setBusy(true);
    const asstId = nid();
    setConvos((cs) => cs.map((c) => c.id === convoId
      ? { ...c, messages: [...c.messages, { id: asstId, role: "assistant", content: "", streaming: true }] }
      : c));
    try {
      let acc = "";
      for await (const chunk of provider.stream(history, answerLang)) {
        acc += chunk;
        const snapshot = acc;
        setConvos((cs) => cs.map((c) => c.id === convoId
          ? { ...c, messages: c.messages.map((m) => m.id === asstId ? { ...m, content: snapshot } : m) }
          : c));
      }
      const meta = await provider.reply(history, answerLang);
      setConvos((cs) => cs.map((c) => c.id === convoId
        ? { ...c, messages: c.messages.map((m) => m.id === asstId
            ? { ...m, content: meta.text, sources: meta.sources, urgent: meta.urgent, streaming: false }
            : m) }
        : c));
    } catch {
      setConvos((cs) => cs.map((c) => c.id === convoId
        ? { ...c, messages: c.messages.map((m) => m.id === asstId ? { ...m, content: "⚠ Connection error.", streaming: false } : m) }
        : c));
    } finally {
      setBusy(false);
    }
  }

  function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    const answerLang = detectMessageLang(content);
    let convoId = activeId;
    if (convoId == null) {
      convoId = nid();
      const title = content.length > 34 ? content.slice(0, 34) + "…" : content;
      const convo: Convo = { id: convoId, title, lang: answerLang, messages: [], time: t("common.today") };
      setConvos((cs) => [convo, ...cs]);
      setActiveId(convoId);
    }
    const userMsg: Msg = { id: nid(), role: "user", content };
    const historyFor: ChatMessage[] = [
      ...(convos.find((c) => c.id === convoId)?.messages ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content },
    ];
    setConvos((cs) => cs.map((c) => c.id === convoId ? { ...c, messages: [...c.messages, userMsg] } : c));
    void runStream(convoId, historyFor, answerLang);
    setSidebarOpen(false);
  }

  function regenerate() {
    if (!active || busy) return;
    const lastUser = [...active.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setConvos((cs) => cs.map((c) => c.id === active.id
      ? { ...c, messages: c.messages.filter((m, i) => i !== c.messages.length - 1 || m.role !== "assistant") }
      : c));
    const history = active.messages.filter((m) => !m.streaming).map((m) => ({ role: m.role, content: m.content }));
    void runStream(active.id, history, detectMessageLang(lastUser.content));
  }

  function copy(m: Msg) {
    void navigator.clipboard?.writeText(m.content).then(() => {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 1600);
    });
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <button
        onClick={() => { setActiveId(null); setInput(""); setSidebarOpen(false); }}
        className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-neon/30 bg-neon/[0.08] py-3 text-sm font-medium text-neonb transition-all hover:bg-neon/[0.15]"
      >
        <Plus className="h-4 w-4" /> {t("common.newChat")}
      </button>
      <div className="relative mb-3">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("ai.searchConv")}
          className="w-full rounded-xl border border-white/[0.08] bg-void/60 py-2.5 ps-9 pe-3 text-sm text-white outline-none placeholder:text-mist/60 focus:border-neon/40"
        />
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto pe-1">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveId(c.id); setSidebarOpen(false); }}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start transition-all",
              c.id === activeId ? "border-neon/35 bg-neon/[0.08]" : "border-transparent hover:border-white/10 hover:bg-white/[0.04]",
            )}
          >
            <MessagesSquare className={cn("h-4 w-4 shrink-0", c.id === activeId ? "text-neonb" : "text-mist")} />
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-[13px]", c.id === activeId ? "text-white" : "text-white/75")}>{c.title}</span>
              <span className="text-[10px] text-mist/70">{c.time}</span>
            </span>
            <span dir="ltr" className="text-[9px] text-mist/50 uppercase">{c.lang}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="px-3 py-6 text-center text-xs text-mist">—</p>}
      </div>
      <div className="mt-3 rounded-xl border border-white/[0.06] bg-void/50 p-3 text-[11px] leading-relaxed text-mist">
        <ShieldCheck className="mb-1 h-4 w-4 text-neon" />
        {t("ai.disclaimer")}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex h-[calc(100dvh-88px)] max-w-7xl gap-4 px-4 pt-[84px] pb-4 sm:px-6 lg:px-8">
      {/* sidebar (desktop) */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className="hidden w-72 shrink-0 rounded-3xl glass p-4 lg:block"
      >
        {Sidebar}
      </motion.aside>

      {/* sidebar (mobile drawer) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: isFa ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isFa ? "-100%" : "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed inset-y-0 start-0 z-50 w-[85%] max-w-xs p-4 lg:hidden"
              style={{ background: "rgba(6,10,15,0.96)" }}
            >
              <button onClick={() => setSidebarOpen(false)} className="mb-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist">
                <X className="h-4 w-4" />
              </button>
              <div className="h-[calc(100%-48px)]">{Sidebar}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main */}
      <motion.main
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className="flex min-w-0 flex-1 flex-col rounded-3xl glass"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-mist lg:hidden">
              <MessagesSquare className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-base font-semibold text-white">{t("ai.title")}</h1>
              <p className="hidden text-[11px] text-mist sm:block">{t("ai.sub")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={isDemoMode() ? "warn" : "success"}>{isDemoMode() ? t("common.demoMode") : provider.label}</Pill>
            <span className="hidden items-center gap-1.5 text-[11px] text-mist sm:flex">
              <Globe className="h-3.5 w-3.5 text-neon" /> {t("ai.langAuto")} {lang.toUpperCase()}
            </span>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">
          {!active && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 scale-150 rounded-full bg-neon/15 blur-2xl" />
                <GlowMark size={74} />
              </div>
              <h2 className="max-w-md font-display text-2xl font-bold text-white sm:text-3xl">{t("ai.emptyTitle")}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">{t("ai.emptySub")}</p>
              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {suggestions.map((s, i) => (
                  <TiltCard key={i} intensity={6} className="group">
                    <button
                      onClick={() => send(s)}
                      className="glass h-full w-full rounded-2xl p-4 text-start text-[13px] leading-relaxed text-white/85 transition-all hover:border-neon/40 hover:text-white"
                      dir="auto"
                    >
                      <Sparkles className="mb-2 h-4 w-4 text-neon/70 transition-colors group-hover:text-neonb" />
                      {s}
                    </button>
                  </TiltCard>
                ))}
              </div>
            </div>
          )}

          {active?.messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
              className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
            >
              {m.role === "assistant" ? (
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neon/30 bg-void shadow-[0_0_18px_-4px_rgba(24,224,196,0.6)]">
                  <GlowMark size={22} />
                </span>
              ) : (
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-azure/40 bg-azure/15 font-display text-xs font-bold text-[#9dbcff]">
                  {isFa ? "شما" : "You".slice(0, 2)}
                </span>
              )}
              <div className={cn("max-w-[86%] sm:max-w-[78%]", m.role === "user" && "text-end")}>
                <div
                  dir="auto"
                  className={cn(
                    "rounded-3xl px-5 py-4",
                    m.role === "user"
                      ? "rounded-tr-md bg-gradient-to-br from-azure/25 to-azure/10 text-sm text-white border border-azure/25 rtl:rounded-tr-3xl rtl:rounded-tl-md"
                      : "rounded-tl-md glass rtl:rounded-tl-3xl rtl:rounded-tr-md",
                  )}
                >
                  {m.urgent && (
                    <div className="mb-3 flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/[0.1] p-3">
                      <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" />
                      <div>
                        <div className="text-[13px] font-semibold text-danger">{t("ai.warnTitle")}</div>
                        <div className="text-[11px] text-danger/70">{t("common.emergencyNote")}</div>
                      </div>
                    </div>
                  )}
                  {m.content === "" && m.streaming ? (
                    <ThinkingDots label={t("ai.thinking")} />
                  ) : (
                    <>
                      <MarkdownLite text={m.content} />
                      {m.streaming && <span className="ms-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-neonb align-middle" />}
                    </>
                  )}
                </div>

                {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] tracking-wider text-mist/70 uppercase">{t("ai.sources")}</span>
                    {m.sources.map((s) => (
                      <a
                        key={s.domain}
                        href={`https://${s.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 text-[11px] text-mist transition-all hover:border-neon/40 hover:text-neonb"
                      >
                        {s.name}
                        <ExternalLink className="h-3 w-3 opacity-60 transition-transform group-hover:scale-110" />
                      </a>
                    ))}
                  </div>
                )}

                {m.role === "assistant" && !m.streaming && m.content && (
                  <div className="mt-2 flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100">
                    <button onClick={() => copy(m)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-mist hover:bg-white/5 hover:text-white">
                      {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === m.id ? t("common.copied") : t("common.copy")}
                    </button>
                    <button onClick={regenerate} disabled={busy} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-mist hover:bg-white/5 hover:text-white disabled:opacity-40">
                      <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
                      {t("common.regenerate")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* input */}
        <div className="border-t border-white/[0.06] p-4">
          {active && !busy && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => send(s)} className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] text-mist transition-all hover:border-neon/40 hover:text-neonb" dir="auto">
                  {s.length > 42 ? s.slice(0, 42) + "…" : s}
                </button>
              ))}
            </div>
          )}
          <div className="neon-frame rounded-2xl">
            <div className="flex items-end gap-2 rounded-2xl bg-void/80 p-2 backdrop-blur-md">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={t("ai.placeholder")}
                rows={1}
                dir="auto"
                className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist/55"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || busy}
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-300",
                  input.trim() && !busy
                    ? "bg-gradient-to-br from-neon to-neonb text-[#032220] shadow-[0_8px_28px_-8px_rgba(24,224,196,0.8)] hover:scale-105"
                    : "border border-white/10 text-mist/50",
                )}
              >
                <SendHorizonal className="h-4.5 w-4.5 rtl:-scale-x-100" />
              </button>
            </div>
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 px-1 text-[10px] leading-relaxed text-mist/60">
            <AlertTriangle className="h-3 w-3 text-warn/70" /> {t("ai.disclaimer")}
          </p>
        </div>
      </motion.main>
    </div>
  );
}

function ThinkingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-mist">
      <span className="relative flex h-6 w-10 items-center justify-between">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-neonb" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </span>
      <span>{label}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-1/2 shimmer-line rounded-full" /></span>
    </div>
  );
}
