import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, KeyRound, Mail, ShieldCheck, User } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { GlowMark, MagneticButton } from "@/components/ui";

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const isLogin = mode === "login";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem("medai_auth", JSON.stringify({ email, name: name || email.split("@")[0], ts: Date.now() }));
    } catch { /* private mode */ }
    navigate("/health");
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        className="neon-frame w-full max-w-md"
      >
        <div className="glass rounded-[1.75rem] p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <GlowMark size={52} />
            <h1 className="mt-5 font-display text-2xl font-bold text-white">{isLogin ? t("auth.loginTitle") : t("auth.regTitle")}</h1>
            <p className="mt-1.5 text-sm text-mist">{isLogin ? t("auth.loginSub") : t("auth.regSub")}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <Field icon={User} label={t("auth.name")} value={name} onChange={setName} type="text" autoComplete="name" />
            )}
            <Field icon={Mail} label={t("auth.email")} value={email} onChange={setEmail} type="email" autoComplete="email" />
            <Field icon={KeyRound} label={t("auth.password")} value={password} onChange={setPassword} type="password" autoComplete={isLogin ? "current-password" : "new-password"} />

            {isLogin && (
              <div className="text-end">
                <span className="cursor-pointer text-xs text-neonb/80 transition-colors hover:text-neonb">{t("auth.forgot")}</span>
              </div>
            )}

            <MagneticButton type="submit" className="w-full py-3.5">
              {isLogin ? t("auth.loginBtn") : t("auth.regBtn")}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </MagneticButton>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-mist">
            {isLogin ? t("auth.noAcc") : t("auth.haveAcc")}
            <Link to={isLogin ? "/get-started" : "/login"} className="font-medium text-neonb hover:underline">
              {isLogin ? t("nav.start") : t("nav.login")}
            </Link>
          </div>

          <div className="mt-7 space-y-2 border-t border-white/[0.06] pt-5 text-[11px] leading-relaxed text-mist/80">
            <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />{t("auth.secure")}</p>
            <p className="flex items-start gap-2"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-azure" />{t("auth.verify")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type, autoComplete }: {
  icon: typeof Mail; label: string; value: string; onChange: (v: string) => void; type: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-mist">{label}</span>
      <span className="group relative block">
        <Icon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/70 transition-colors group-focus-within:text-neonb" />
        <input
          required
          type={type}
          dir="ltr"
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/[0.09] bg-void/70 py-3 ps-10 pe-4 text-sm text-white outline-none transition-all placeholder:text-mist/50 focus:border-neon/50 focus:shadow-[0_0_24px_-6px_rgba(24,224,196,0.35)]"
        />
      </span>
    </label>
  );
}
