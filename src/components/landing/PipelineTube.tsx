import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { RobotMascot } from "./RobotMascot";

type Station = { id: string };

/** SVG "pipeline tube" connecting three stations, with glowing dots
 *  traveling left-to-right via motionPath. */
export function PipelineTube({ highlight }: { highlight: string | null }) {
  return (
    <svg
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 right-0 top-1/2 h-32 -translate-y-1/2 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="tube-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(168,85,247,0.15)" />
          <stop offset="50%" stopColor="rgba(232,121,249,0.25)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0.15)" />
        </linearGradient>
      </defs>

      {/* base tube */}
      <path d="M40,60 Q250,30 500,60 T960,60" fill="none" stroke="url(#tube-base)" strokeWidth="10" strokeLinecap="round" />
      {/* highlight stroke */}
      <path d="M40,56 Q250,26 500,56 T960,56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />

      {/* traveling dots */}
      <Dots highlight={highlight} />
    </svg>
  );
}

const DOTS = Array.from({ length: 10 }, (_, i) => ({
  offset: i / 10,
  size: 2 + (i % 3) * 1.2,
  speed: 4 + (i % 3) * 2,
  color: i % 3 === 0 ? "#e879f9" : i % 3 === 1 ? "#a855f7" : "#ffffff",
}));

const Dots = ({ highlight }: { highlight: string | null }) => {
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <g>
      {DOTS.map((d, i) => {
        const phase = (t / d.speed + d.offset) % 1;
        // sample the cubic-bezier-ish curve above
        const x = 40 + phase * 920;
        const y = 60 - 30 * Math.sin(phase * Math.PI * 2);
        const highlighted = highlight === `dot-${i % 3}`;
        return (
          <circle key={i} cx={x} cy={y} r={d.size + (highlighted ? 1.5 : 0)} fill={d.color} opacity={highlighted ? 1 : 0.7} />
        );
      })}
    </g>
  );
};

const STATIONS = [
  { num: "01", title: "Paste JSON", color: "#a855f7" },
  { num: "02", title: "Generate URL", color: "#e879f9" },
  { num: "03", title: "Hit the API", color: "#7c3aed" },
];

export function HowItWorks() {
  const [hover, setHover] = useState<number | null>(null);
  const [pointedCard, setPointedCard] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const card0Ref = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const cardRefs = useMemo(() => [card0Ref, card1Ref, card2Ref], []);
  const onPointCard = useCallback((index: number | null) => setPointedCard(index), []);

  return (
    <section
      id="how-it-works"
      className="relative py-24 md:py-32"
      style={{ background: "var(--how-bg)" }}
    >
      <div className="container">
        <div className="mb-14 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--purple-electric)]">
            How it works
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-white">
            Three steps. Zero friction.
          </h2>
        </div>

        <div className="relative">
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <PipelineTube highlight={hover !== null ? `dot-${hover % 3}` : null} />

            {STATIONS.map((s, i) => (
              <div
                key={s.num}
                ref={cardRefs[i]}
                className="relative"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                data-cursor-hover
              >
                <div
                  className="absolute -top-10 left-0 font-mono text-5xl font-bold transition-opacity duration-300"
                  style={{
                    opacity: hover === null ? 0.1 : hover === i ? 1 : 0.04,
                    color: s.color,
                  }}
                >
                  {s.num}
                </div>
                <div
                  className={`glow-border mt-6 rounded-lg p-5 transition-all${pointedCard === i ? " card-pointed" : ""}`}
                  style={{
                    ["--card-bg" as string]: "var(--how-bg)",
                    transform: hover === i ? "translateY(-6px)" : "translateY(0)",
                  }}
                >
                  <Station index={i} active={hover === i} />
                </div>
              </div>
            ))}
          </div>

          <div ref={trackRef} className="hiw-robot-stage">
            <RobotMascot trackRef={trackRef} cardRefs={cardRefs} onPointCard={onPointCard} />
          </div>
        </div>
      </div>
    </section>
  );
}

const Station = ({ index, active }: { index: number; active: boolean }) => {
  if (index === 0) return <Station1 active={active} />;
  if (index === 1) return <Station2 active={active} />;
  return <Station3 active={active} />;
};

const Station1 = ({ active: _active }: { active: boolean }) => (
  <div>
    <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
      <span className="text-2xl text-[var(--purple-electric)]" style={{ animation: "pulse-glow-pill 4s ease-in-out infinite" }}>{ "{ }" }</span>
      Paste JSON
    </h3>
    <pre className="rounded-md border border-white/10 bg-black/40 p-3 text-[11px] font-mono text-white/70">{`{
  "id": 42,
  "name": "ada"
}`}</pre>
  </div>
);

const Station2 = ({ active }: { active: boolean }) => (
  <div>
    <h3 className="mb-3 font-semibold text-white">Generate URL</h3>
    <button
      className="rounded-md bg-[var(--purple-violet)] px-3 py-1.5 text-xs font-semibold text-white"
      style={{
        animation: "self-click 2s ease-in-out infinite",
        transform: active ? "scale(0.92)" : "scale(1)",
      }}
    >
      Generate
    </button>
    <div className="mt-2 text-[10px] font-mono text-white/40">mockdrop.io/api/a7b8c9</div>
    <style>{`@keyframes self-click { 0%,100%{transform:scale(1)} 10%{transform:scale(0.92)} 20%{transform:scale(1)} }`}</style>
  </div>
);

const Station3 = ({ active }: { active: boolean }) => (
  <div>
    <h3 className="mb-3 font-semibold text-white">Hit the API</h3>
    <pre className="rounded-md border border-white/10 bg-black/40 p-2 text-[10px] font-mono text-white/60">
      curl mockdrop.io/api/a7b8c9
    </pre>
    {active && (
      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 [animation:fade-in_0.4s_forwards]">
        200 OK
      </div>
    )}
  </div>
);
