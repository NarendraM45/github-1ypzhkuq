import { useEffect, useRef, useState } from "react";

const CODE = '"user": "ada lovelace"';
const URL_LINE = "mockdrop.io/api/a7b8c9d2";

/** Card 1 — Zero Setup: typed code + URL reveal, loops indefinitely. */
export function ZeroSetupDemo({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const phase = useRef<"typing" | "url" | "hold" | "reset">("typing");

  useEffect(() => {
    if (!active) return;
    let t: number;
    let i = 0;
    setTyped("");
    setShowUrl(false);
    phase.current = "typing";

    const tick = () => {
      if (phase.current === "typing") {
        i++;
        setTyped(CODE.slice(0, i));
        if (i >= CODE.length) {
          phase.current = "url";
          t = window.setTimeout(() => {
            setShowUrl(true);
            phase.current = "hold";
            t = window.setTimeout(() => {
              phase.current = "reset";
              i = 0;
              setTyped("");
              setShowUrl(false);
              phase.current = "typing";
              t = window.setTimeout(tick, 200);
            }, 2200);
          }, 400);
          return;
        }
        t = window.setTimeout(tick, 55);
      }
    };
    t = window.setTimeout(tick, 400);
    return () => window.clearTimeout(t);
  }, [active]);

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed">
      <div className="text-white/40">{ "{" }{showUrl ? "" : ""}</div>
      <div className="pl-3">
        {typed}
        {!showUrl && <span className="ml-0.5 inline-block h-3 w-1.5 bg-[var(--purple-electric)] align-middle" />}
      </div>
      {showUrl && (
        <div className="mt-1 pl-3 text-[var(--purple-electric)] opacity-0 [animation:fade-in_0.4s_forwards]">
          {URL_LINE}
        </div>
      )}
      <div className="text-white/40">{ "}" }</div>
    </div>
  );
}
