import { useEffect, useRef, useState } from "react";

type Phase = "broken" | "fixing" | "valid";

/** Card 2 — Live Validation: broken JSON → fixed → check draws → badge. */
export function LiveValidationDemo({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<Phase>("broken");
  const [drawCheck, setDrawCheck] = useState(false);

  useEffect(() => {
    if (!active) return;
    let t: number;
    const run = () => {
      setPhase("broken");
      t = window.setTimeout(() => {
        setPhase("fixing");
        t = window.setTimeout(() => {
          setPhase("valid");
          setDrawCheck(true);
          t = window.setTimeout(() => {
            setDrawCheck(false);
            t = window.setTimeout(run, 1000);
          }, 2200);
        }, 600);
      }, 1800);
    };
    run();
    return () => window.clearTimeout(t);
  }, [active]);

  return (
    <div className="mt-4">
      <div className="rounded-md border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed">
        {phase === "broken" ? (
          <div>
            <span className="text-white/40">{ "{ " }</span>
            <span className="underline decoration-wavy decoration-red-500 text-white/80">"name" "ada"</span>
            <span className="text-white/40"> </span>
            <span className="underline decoration-wavy decoration-red-500 text-white/80">"age" 21,</span>
            <span className="text-white/40">{ " }" }</span>
          </div>
        ) : (
          <div>
            <span className="text-white/40">{ "{ " }</span>
            <span className="text-[#a855f7]">"name"</span>: <span className="text-emerald-300">"ada"</span>,
            <span className="text-[#a855f7]">"age"</span>: <span className="text-cyan-300">21</span>
            <span className="text-white/40">{ " }" }</span>
          </div>
        )}
      </div>

      {phase === "valid" && (
        <div className="mt-2 flex items-center gap-2 opacity-0 [animation:fade-in_0.4s_forwards]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8 L7 12 L13 4"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: drawCheck ? 0 : 30,
                transition: "stroke-dashoffset 0.4s ease-out",
              }}
            />
          </svg>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            Valid JSON
          </span>
        </div>
      )}
    </div>
  );
}
