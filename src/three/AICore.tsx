import { Component, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

const Scene = lazy(() => import("./AICoreScene"));

/** Pure-CSS holographic core — used as fallback & for reduced motion. */
export function CSSCore({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden>
      <div className="absolute h-[46%] w-[46%] rounded-full bg-neon/25 blur-3xl animate-breathe" />
      <div className="absolute h-2/3 w-2/3 rounded-full holo-ring animate-[spin_26s_linear_infinite]" />
      <div className="absolute h-[86%] w-[86%] rounded-full border border-azure/20 animate-[spin_38s_linear_infinite_reverse]" />
      <div className="h-[38%] w-[38%] rounded-full animate-breathe bg-[radial-gradient(circle_at_35%_32%,#2ffff0,#18e0c4_42%,#063a3d_78%,#03161a)] shadow-[0_0_90px_-8px_rgba(24,224,196,0.75),inset_0_0_44px_rgba(2,20,22,0.8)]" />
    </div>
  );
}

class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* WebGL unavailable — CSS fallback already swapped in */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function AICore({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const fallback = <CSSCore className={className} />;
  if (reduced) return fallback;
  return (
    <GLBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <div className={className}>
          <Scene />
        </div>
      </Suspense>
    </GLBoundary>
  );
}
