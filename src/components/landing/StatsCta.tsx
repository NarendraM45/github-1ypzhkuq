import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "./shared/MagneticButton";
import { useInView } from "@/hooks/useInView";

const PHRASES = ["No signup.", "No credit card.", "No backend."];

const Counter = ({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 800;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutExpo-ish
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-6xl font-bold font-mono text-white">
        {val.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
};

const InfinityCounter = ({ label }: { label: string }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const [draw, setDraw] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setDraw(true), 100);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <div ref={ref} className="text-center">
      <svg width="80" height="40" viewBox="0 0 80 40" className="mx-auto">
        <path
          d="M10,20 C10,8 22,8 30,20 C38,32 50,32 50,20 C50,8 62,8 70,20 C62,32 50,32 50,20 C50,8 38,8 30,20 C22,32 10,32 10,20 Z"
          fill="none"
          stroke="#e879f9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset={draw ? 0 : 200}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="mt-1 text-xs uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
};

export function StatsCta() {
  const [burst, setBurst] = useState(false);
  const { ref: auroraRef, inView } = useInView<HTMLDivElement>(0.05);

  return (
    <section
      id="stats"
      className="relative py-24 md:py-32"
      style={{ background: "var(--stats-bg)" }}
    >
      <div
        ref={auroraRef}
        className={`aurora-bg pointer-events-none absolute inset-0 opacity-40 ${inView ? "" : "[animation-play-state:paused]"}`}
        aria-hidden
      />

      <div className="container relative">
        <div className="mb-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Counter end={1247} label="Endpoints created" />
          <Counter end={10} suffix="ms" label="Avg response" />
          <InfinityCounter label="Free forever" />
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Ship faster. Mock everything.
          </h2>

          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {PHRASES.map((p, i) => (
              <span
                key={p}
                className="inline-block text-sm text-white/60 opacity-0"
                style={{ animation: `fade-in 0.4s ease-out ${i * 0.15}s forwards` }}
              >
                {p}
              </span>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <MagneticButton
              maxDisplacement={10}
              radius={80}
              className="glow-border inline-flex items-center gap-2 rounded-md px-8 py-4 text-lg font-semibold text-white"
              as="button"
              onClick={() => setBurst((v) => !v)}
            >
              <span className="absolute inset-0 rounded-md" style={{ background: "var(--purple-violet)", zIndex: 0 }} />
              <span className="relative z-10 flex items-center gap-2">
                {burst && <ParticleBurst />}
                Get Started Free
                <ArrowRight className="h-5 w-5" style={{ animation: "arrow-nudge 1s ease-in-out infinite" }} />
              </span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const ParticleBurst = () => (
  <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
    {Array.from({ length: 8 }).map((_, i) => (
      <span
        key={i}
        className="absolute h-1 w-1 rounded-full bg-[var(--pink-hot)]"
        style={{
          // @ts-expect-error custom prop
          "--tx": `${Math.cos((i / 8) * Math.PI * 2) * 40}px`,
        }}
      >
        <style>{`
          span[style*="--tx"] {
            animation: burst 0.6s ease-out forwards;
            transform: translate(var(--tx), ${Math.sin((0) * Math.PI * 2) * 40}px);
          }
          @keyframes burst {
            0% { opacity: 1; transform: translate(0,0) scale(1); }
            100% { opacity: 0; transform: translate(var(--tx), -40px) scale(0.3); }
          }
        `}</style>
      </span>
    ))}
  </span>
);
