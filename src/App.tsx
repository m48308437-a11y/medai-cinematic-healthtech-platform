import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { BackgroundFX, GlowMark } from "@/components/ui";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = lazy(() => import("@/pages/Home"));
const Assistant = lazy(() => import("@/pages/Assistant"));
const Symptoms = lazy(() => import("@/pages/Symptoms"));
const Labs = lazy(() => import("@/pages/Labs"));
const Medications = lazy(() => import("@/pages/Medications"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Admin = lazy(() => import("@/pages/Admin"));
const Auth = lazy(() => import("@/pages/Auth"));

const NO_FOOTER = ["/assistant", "/admin", "/login", "/get-started"];

function Loader() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-neon/20 blur-2xl" />
        <div className="animate-breathe"><GlowMark size={64} /></div>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!location.hash.split("#")[1]?.startsWith("/#")) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);
  return null;
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Shell() {
  const location = useLocation();
  const showFooter = !NO_FOOTER.some((p) => location.pathname.startsWith(p));
  return (
    <>
      <BackgroundFX />
      <Navbar />
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/assistant" element={<Page><Assistant /></Page>} />
            <Route path="/symptoms" element={<Page><Symptoms /></Page>} />
            <Route path="/labs" element={<Page><Labs /></Page>} />
            <Route path="/medications" element={<Page><Medications /></Page>} />
            <Route path="/health" element={<Page><Dashboard /></Page>} />
            <Route path="/admin" element={<Page><Admin /></Page>} />
            <Route path="/login" element={<Page><Auth mode="login" /></Page>} />
            <Route path="/get-started" element={<Page><Auth mode="register" /></Page>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </LanguageProvider>
  );
}
