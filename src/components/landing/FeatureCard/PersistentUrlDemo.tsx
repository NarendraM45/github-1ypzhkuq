import { useEffect, useState } from "react";

/** Card 6 — Persistent URLs: URL bar + white-flash refresh + second window with same JSON. */
export function PersistentUrlDemo({ active }: { active: boolean }) {
  const [flash, setFlash] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    let aborted = false;
    let t: number;
    const cycle = () => {
      if (aborted) return;
      setFlash(true);
      t = window.setTimeout(() => {
        if (aborted) return;
        setFlash(false);
        setSecondOpen(true);
        t = window.setTimeout(() => {
          if (aborted) return;
          setSecondOpen(false);
          t = window.setTimeout(cycle, 600);
        }, 2400);
      }, 200);
    };
    t = window.setTimeout(cycle, 800);
    return () => {
      aborted = true;
      window.clearTimeout(t);
    };
  }, [active]);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white/50">
        <span className="text-[var(--purple-electric)]">⟳</span>
        mockdrop.io/a7b8c9d2
        {flash && (
          <span className="ml-auto h-3 w-12 rounded bg-white/80 [animation:fade-in_0.15s_forwards] [animation-name:fade-out]" />
        )}
      </div>
      <Window label="Response" highlight />
      {secondOpen && (
        <div className="opacity-0 [animation:fade-in_0.4s_forwards]">
          <Window label="After refresh — same JSON" />
        </div>
      )}
    </div>
  );
}

const Window = ({ label, highlight }: { label: string; highlight?: boolean }) => (
  <div className="rounded-md border border-white/10 bg-black/40 p-2">
    <div className="mb-1 text-[9px] uppercase tracking-wider text-white/40">{label}</div>
    <pre className="text-[10px] font-mono text-white/70 leading-relaxed">
{`{
  "id": 42,
  "name": "ada"
}`}
    </pre>
    {highlight && (
      <div className="mt-1 h-1 w-full rounded bg-[var(--purple-electric)]/30" />
    )}
  </div>
);
