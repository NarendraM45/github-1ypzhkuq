import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";
import HeroBlobCanvas from "../HeroBlobCanvas";

const PHRASES = ["Mock your endpoints.", "Test your UI now.", "Ship faster."];

const Typewriter = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIdx];
    const speed = deleting ? 40 : 75;
    const t = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next.length === 0) {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % PHRASES.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, phraseIdx]);

  return (
    <span className="text-gradient-brand font-semibold">
      {text}
      <span className="inline-block w-[2px] h-[1em] -mb-1 bg-primary-glow ml-0.5 animate-blink align-middle" />
    </span>
  );
};

const Counter = ({ end, suffix = "", duration = 1400 }: { end: number; suffix?: string; duration?: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(end * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
};

export const Hero = () => {
  const badgeRef = useRef(null);
  const h1Ref = useRef(null);
  const subRef = useRef(null);
  const statsRef = useRef(null);
  const ctasRef = useRef(null);

  const scrollToEditor = () => {
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#09090f', display: 'flex', flexDirection: 'column' }}
      className="pt-32 pb-20 md:pt-40 md:pb-28"
    >
      <HeroBlobCanvas textRefs={{ badgeRef, h1Ref, subRef, ctasRef, statsRef }} />
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="mx-auto max-w-3xl text-center md:text-left md:mx-0">
          <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Now in public beta — Free forever
          </div>

          <h1 ref={h1Ref} className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-slate-200">
            The fastest way to{" "}
            <span className="text-gradient-brand">mock an API</span>{" "}
            endpoint
          </h1>

          <p ref={subRef} className="mt-6 text-lg md:text-xl text-muted-foreground min-h-[2em]">
            <Typewriter />
          </p>

          <div ref={statsRef} className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
            <StatPill icon={<Clock className="h-3.5 w-3.5" />} label={<><Counter end={10} />ms response time</>} />
            <StatPill icon={<InfinityIcon className="h-3.5 w-3.5" />} label="Unlimited endpoints" />
            <StatPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="No signup needed" />
          </div>

          <div ref={ctasRef} className="mt-10 flex justify-center md:justify-start">
            <button
              onClick={scrollToEditor}
              className="btn-primary group inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-base font-semibold"
            >
              Create Your First Endpoint
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatPill = ({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur">
    <span className="text-primary-glow">{icon}</span>
    {label}
  </div>
);
