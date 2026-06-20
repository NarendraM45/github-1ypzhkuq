import { useEffect, useState } from "react";

/** Card 5 — CORS Ready: envelope travels curve between two windows, badge fades in. */
export function CorsDemo({ active }: { active: boolean }) {
  const [t, setT] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let aborted = false;
    const start = performance.now();
    const loop = (now: number) => {
      if (aborted) return;
      const elapsed = (now - start) / 1000;
      const cycle = elapsed % 3; // 3s loop
      setT(cycle / 3); // 0..1
      setShowBadge(cycle > 0.6 && cycle < 2.6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      aborted = true;
      cancelAnimationFrame(raf);
    };
  }, [active]);

  // Curve: simple quadratic from (40, 30) to (200, 30) with peak at (120, -10)
  const x = 40 + t * 160;
  const y = 30 - 40 * Math.sin(t * Math.PI);

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-2">
        <Window label="localhost:3000" />
        <Window label="mockdrop.io" />
      </div>
      <svg viewBox="0 0 250 60" className="mt-1 h-14 w-full overflow-visible">
        <path d="M40,30 Q125,-10 210,30" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="3 3" />
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-7" y="-5" width="14" height="10" rx="2" fill="#a855f7">
            <animate attributeName="opacity" values="1;0.6;1" dur="0.8s" repeatCount="indefinite" />
          </rect>
        </g>
      </svg>
      {showBadge && (
        <div className="mt-1 rounded bg-[var(--purple-electric)]/15 px-2 py-0.5 text-center text-[10px] font-mono text-[var(--purple-electric)] opacity-0 [animation:fade-in_0.4s_forwards]">
          Access-Control-Allow-Origin: *
        </div>
      )}
    </div>
  );
}

const Window = ({ label }: { label: string }) => (
  <div className="w-2/5 rounded-t-md border border-b-0 border-white/10 bg-black/40 px-2 pt-1">
    <div className="flex gap-1 pb-1">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
      <span className="h-1.5 w-1.5 rounded-full bg-green-400/70" />
    </div>
    <div className="truncate text-[9px] font-mono text-white/40">{label}</div>
  </div>
);
