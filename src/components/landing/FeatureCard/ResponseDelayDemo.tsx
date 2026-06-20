import { useEffect, useRef, useState } from "react";

/** Card 4 — Response Delay: 0→100% over 1.2s/100ms side-by-side. */
export function ResponseDelayDemo({ active }: { active: boolean }) {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    let aborted = false;

    const run = (duration: number, set: (n: number) => void) => {
      const start = performance.now();
      const step = (now: number) => {
        if (aborted) return;
        const v = Math.min(100, ((now - start) / duration) * 100);
        set(v);
        if (v < 100) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const cycle = () => {
      if (aborted) return;
      setP1(0); setP2(0);
      run(1200, setP1);
      run(100, setP2);
      setTimeout(cycle, 3200);
    };
    cycle();
    return () => {
      aborted = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <div className="mt-4 space-y-3">
      <Bar label="time: 1200ms" value={p1} color="#a855f7" />
      <Bar label="time: 10ms" value={p2} color="#06b6d4" />
    </div>
  );
}

const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="mb-1 text-[10px] font-mono text-white/50">{label}</div>
    <div className="h-2 w-full overflow-hidden rounded bg-white/10">
      <div
        className="h-full rounded transition-[width] duration-75"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  </div>
);
