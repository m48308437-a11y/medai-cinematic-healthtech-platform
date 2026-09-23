import { Link } from "react-router-dom";
import { ArrowUpRight, Database, Lock, ScrollText, ShieldCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { GlowMark } from "./ui";

export default function Footer() {
  const { t, arr } = useLang();
  const product = arr("footer.items1");
  const platform = arr("footer.items2");
  const legal = arr("footer.items3");
  const productLinks = ["/assistant", "/symptoms", "/labs", "/medications"];
  const platformLinks = ["/health", "/health", "/admin", "/#rag"];

  return (
    <footer className="relative mt-28 border-t border-white/[0.06]">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <GlowMark size={30} />
              <span className="font-display text-lg font-bold tracking-[0.18em]">MED<span className="gradient-text">AI</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">{t("footer.desc")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Lock, label: "AES-256" },
                { icon: ShieldCheck, label: "RBAC" },
                { icon: ScrollText, label: "Audit logs" },
                { icon: Database, label: "RAG grounded" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-mist">
                  <b.icon className="h-3 w-3 text-neon" /> {b.label}
                </span>
              ))}
            </div>
          </div>

          <FooterCol title={t("footer.product")} items={product} links={productLinks} />
          <FooterCol title={t("footer.company")} items={platform} links={platformLinks} />
          <FooterCol title={t("footer.legal")} items={legal} links={["/#safety", "/#safety", "/#trust", "/#trust"]} />
        </div>

        <div className="rounded-2xl border border-warn/20 bg-warn/[0.05] px-5 py-4 text-[13px] leading-relaxed text-warn/90">
          <strong className="font-semibold">{t("common.notDoctor")}</strong> {t("common.emergencyNote")}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-7 text-xs text-mist sm:flex-row">
          <span>© 2026 MEDAI Labs — {t("footer.rights")}</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-dot" />
            {t("footer.madeWith")}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items, links }: { title: string; items: string[]; links: string[] }) {
  return (
    <div>
      <h4 className="mb-4 font-display text-sm font-semibold tracking-wider text-white/90">{title}</h4>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={it}>
            <Link
              to={links[i] ?? "/"}
              className="group inline-flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-neonb"
            >
              {it}
              <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
