import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Globe, Menu, ShieldCheck, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { languages } from "@/i18n/translations";
import { GlowMark, MagneticButton } from "./ui";
import { cn } from "@/utils/cn";

const LINKS = [
  { to: "/assistant", key: "nav.assistant" },
  { to: "/symptoms", key: "nav.symptoms" },
  { to: "/labs", key: "nav.labs" },
  { to: "/medications", key: "nav.meds" },
  { to: "/health", key: "nav.health" },
] as const;

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={cn("flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1", compact && "w-full justify-center")}>
      <Globe className="ms-1 h-3.5 w-3.5 text-mist" />
      {languages.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300",
            lang === l.id ? "bg-neon text-[#032220] shadow-[0_0_14px_rgba(24,224,196,0.5)]" : "text-mist hover:text-white",
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { t, dir } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  const goAbout = () => {
    if (loc.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById("trust")?.scrollIntoView({ behavior: "smooth" }), 250);
    } else {
      document.getElementById("trust")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "border-b border-white/[0.06] bg-[#04080c]/80 shadow-[0_10px_44px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="transition-transform duration-500 group-hover:rotate-[18deg]"><GlowMark /></span>
            <span className="font-display text-lg font-bold tracking-[0.18em] text-white">
              MED<span className="gradient-text">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
                    isActive ? "text-neonb" : "text-mist hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {t(l.key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full border border-neon/25 bg-neon/[0.08]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            <button onClick={goAbout} className="rounded-full px-4 py-2 text-sm text-mist transition-colors hover:text-white">
              {t("nav.about")}
            </button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LangSwitch />
            <Link to="/login" className="px-3 py-2 text-sm text-mist transition-colors hover:text-white">{t("nav.login")}</Link>
            <MagneticButton to="/get-started" className="px-5 py-2.5">
              {t("nav.start")}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </MagneticButton>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white lg:hidden"
            aria-label={t("nav.menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-[#02050a]/85 backdrop-blur-2xl" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
              dir={dir}
              className="absolute inset-x-4 top-20 rounded-3xl glass p-6"
            >
              <nav className="flex flex-col">
                {[...LINKS.map((l) => ({ to: l.to as string, label: t(l.key) })), { to: "/admin", label: t("nav.admin") }].map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: dir === "rtl" ? 18 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1 }}
                  >
                    <Link to={l.to} className="flex items-center justify-between border-b border-white/[0.06] py-3.5 font-display text-lg text-white/90 transition-colors hover:text-neonb">
                      {l.label}
                      <ArrowUpRight className="h-4 w-4 text-neon/60 rtl:-scale-x-100" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <LangSwitch compact />
                <div className="flex gap-3">
                  <MagneticButton to="/login" variant="ghost" className="flex-1 py-3">{t("nav.login")}</MagneticButton>
                  <MagneticButton to="/get-started" className="flex-1 py-3">{t("nav.start")}</MagneticButton>
                </div>
                <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-mist">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon" /> {t("auth.secure")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
