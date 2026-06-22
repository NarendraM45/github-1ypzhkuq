import { lazy, Suspense, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";
import { MagneticButton } from "./shared/MagneticButton";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const CrystallineBlob = lazy(() => import("./CrystallineBlob"));

const WORDMARK = "MockDrop";

/** CSS-only fallback: layered magenta radial gradients + screen blending
 *  approximates the volumetric crystal glow without WebGL. */
const BlobFallback = () => (
  <div aria-hidden className="pointer-events-none absolute right-[-6%] top-1/2 -translate-y-1/2 h-[28rem] w-[28rem]">
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 35% 35%, #ffffff 0%, #ff3df0 18%, #ff00cc 38%, #cc00ff 60%, transparent 78%)",
        filter: "blur(2px)",
        mixBlendMode: "screen",
      }}
    />
    <div
      className="absolute inset-[-20%] rounded-full"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,0,204,0.55) 0%, rgba(204,0,255,0.35) 40%, transparent 72%)",
        filter: "blur(28px)",
        mixBlendMode: "screen",
      }}
    />
    <div
      className="absolute inset-[-50%] rounded-full"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(204,0,255,0.35) 0%, rgba(124,58,237,0.18) 55%, transparent 80%)",
        filter: "blur(48px)",
        mixBlendMode: "screen",
      }}
    />
  </div>
);

const PHRASES = ["Mock your endpoints.", "Test your UI now.", "Ship faster."];

const Typewriter = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useGSAP(() => {
    const current = PHRASES[phraseIdx];
    const speed = deleting ? 0.04 : 0.075;
    const tween = gsap.to(
      {},
      {
        duration: speed,
        repeat: 0,
        onComplete: () => {
          if (!deleting) {
            const next = current.slice(0, text.length + 1);
            setText(next);
            if (next === current) {
              gsap.delayedCall(1.4, () => setDeleting(true));
            }
          } else {
            const next = current.slice(0, text.length - 1);
            setText(next);
            if (next.length === 0) {
              setDeleting(false);
              setPhraseIdx((i) => (i + 1) % PHRASES.length);
            }
          }
        },
      }
    );
    return () => {
      tween.kill();
    };
  }, [text, deleting, phraseIdx]);

  return (
    <span className="text-gradient-brand font-semibold sub-cursor">
      {text}
    </span>
  );
};

const Counter = ({ end }: { end: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            if (reduced) {
              el.textContent = String(end);
              return;
            }
            const obj = { v: 0 };
            gsap.to(obj, {
              v: end,
              duration: 0.8,
              ease: "expo.out",
              onUpdate: () => {
                el.textContent = String(Math.round(obj.v));
              },
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, reduced]);

  return <span ref={ref}>0</span>;
};

const Pill = ({ icon, children, delay }: { icon: React.ReactNode; children: React.ReactNode; delay: number }) => (
  <div
    className="hero-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 backdrop-blur"
    style={{ animation: `pulse-glow-pill var(--pulse) ease-in-out ${delay}s infinite` }}
  >
    <span className="text-[var(--purple-electric)]">{icon}</span>
    {children}
  </div>
);

export const Hero = () => {
  const root = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const reduced = usePrefersReducedMotion();
  const pointer = useRef({ x: 0, y: 0 });

  // Global pointer tracking for blob cursor-follow.
  useGSAP(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Load sequence: 400ms void → wordmark letter dissolve → cross-fade group.
  useGSAP(
    () => {
      if (reduced) {
        setLoaded(true);
        gsap.set(".hero-wordmark-letter", { opacity: 1, filter: "blur(0px)" });
        gsap.set(".hero-group", { opacity: 1 });
        return;
      }
      const tl = gsap.timeline();
      tl.set(".hero-wordmark-letter", { opacity: 0, filter: "blur(12px)" });
      tl.set(".hero-group", { opacity: 0, y: 12 });
      tl.to(".hero-wordmark-letter", {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.4,
      });
      tl.to(".hero-group", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => setLoaded(true),
      });
      return () => {
        tl.kill();
      };
    },
    { scope: root }
  );

  const scrollToEditor = () => {
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const navigate = useNavigate();
  const goApp = () => navigate("/app");

  return (
    <section
      ref={root}
      id="top"
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #0f0a1a 0%, var(--bg-void) 70%)",
      }}
    >
      {/* noise grain overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] mix-blend-overlay" aria-hidden>
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      {/* 3D crystalline blob — magenta geode with breathing glow */}
      {!reduced && (
        <Suspense fallback={<BlobFallback />}>
          <CrystallineBlob pointer={pointer} />
        </Suspense>
      )}
      {reduced && <BlobFallback />}

      <div className="container relative z-10 pt-40 md:pt-48 pb-28">
        {/* Wordmark (load sequence) */}
        <div className="flex justify-center md:justify-start mb-6">
          <h2 className="text-2xl font-bold tracking-tight flex" aria-label={WORDMARK}>
            {WORDMARK.split("").map((ch, i) => (
              <span key={i} className="hero-wordmark-letter text-white">
                {ch}
              </span>
            ))}
          </h2>
        </div>

        <div className="hero-group mx-auto max-w-3xl text-center md:text-left md:mx-0">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white">
            The fastest way to{" "}
            <span
              className="text-gradient-brand"
              style={{
                background: "linear-gradient(90deg, #a855f7, #e879f9)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.04em",
                filter: "drop-shadow(0 2px 12px rgba(168,85,247,0.4))",
              }}
            >
              mock an API
            </span>{" "}
            endpoint
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/60 min-h-[2em]">
            <Typewriter />
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
            <Pill icon={<Counter end={10} />} delay={0}>
              <>ms response time</>
            </Pill>
            <Pill icon={<InfinityIcon className="h-3.5 w-3.5" />} delay={1}>
              Unlimited endpoints
            </Pill>
            <Pill icon={<ShieldCheck className="h-3.5 w-3.5" />} delay={2}>
              No signup needed
            </Pill>
          </div>

          <div className="mt-10 flex justify-center md:justify-start">
            <MagneticButton
              onClick={scrollToEditor}
              className="glow-border inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-base font-semibold text-white"
              as="button"
            >
              <span
                className="absolute inset-0 rounded-md"
                style={{ background: "var(--purple-violet)", zIndex: 0 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {loaded ? "Create Your First Endpoint" : "Loading…"}
                <ArrowRight className="h-4 w-4" />
              </span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
};
