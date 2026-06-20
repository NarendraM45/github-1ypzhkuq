import { useEffect, useRef, useState } from "react";

const CODES = [200, 404, 500, 201];
const REST_INTERVAL = 1500;
const HOVER_INTERVAL = 300;

/** Card 3 — Custom Status Codes: Y-axis 3D flip slot machine. */
export function StatusCodesDemo({ active }: { active: boolean }) {
  const [idx, setIdx] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [hovering, setHovering] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let t: number;
    const interval = () => (hovering ? HOVER_INTERVAL : REST_INTERVAL);
    const tick = () => {
      setFlipping(true);
      t = window.setTimeout(() => {
        setIdx((i) => (i + 1) % CODES.length);
        setFlipping(false);
        t = window.setTimeout(tick, interval());
      }, 300);
    };
    t = window.setTimeout(tick, interval());
    return () => window.clearTimeout(t);
  }, [active, hovering]);

  return (
    <div
      className="mt-4 flex items-center justify-center"
      onMouseEnter={() => {
        setHovering(true);
        if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      }}
      onMouseLeave={() => {
        // reset to 200 on leave
        leaveTimer.current = window.setTimeout(() => {
          setHovering(false);
          setIdx(0);
        }, 300);
      }}
    >
      <div style={{ perspective: 600 }}>
        <div
          className="h-20 w-28 flex items-center justify-center rounded-md border border-white/10 bg-black/40 font-mono text-3xl font-bold"
          style={{
            transformStyle: "preserve-3d",
            transform: flipping ? "rotateY(90deg)" : "rotateY(0deg)",
            transition: "transform 0.3s ease-in-out",
            color: idx === 0 ? "#10b981" : idx === 3 ? "#06b6d4" : "#ef4444",
          }}
        >
          {CODES[idx]}
        </div>
      </div>
    </div>
  );
}
