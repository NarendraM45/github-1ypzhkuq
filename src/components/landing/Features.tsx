import { useRef } from "react";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, OctagonAlert as AlertOctagon, Timer, Globe, Database } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AnimatedUnderline } from "./shared/AnimatedUnderline";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { useInView } from "@/hooks/useInView";
import { ZeroSetupDemo } from "./FeatureCard/ZeroSetupDemo";
import { LiveValidationDemo } from "./FeatureCard/LiveValidationDemo";
import { StatusCodesDemo } from "./FeatureCard/StatusCodesDemo";
import { ResponseDelayDemo } from "./FeatureCard/ResponseDelayDemo";
import { CorsDemo } from "./FeatureCard/CorsDemo";
import { PersistentUrlDemo } from "./FeatureCard/PersistentUrlDemo";

const FEATURES = [
  { icon: Rocket, title: "Zero Setup", desc: "No server, no config files. Paste JSON and go.", Demo: ZeroSetupDemo },
  { icon: ShieldCheck, title: "Live Validation", desc: "Invalid JSON is caught before saving.", Demo: LiveValidationDemo },
  { icon: AlertOctagon, title: "Custom Status Codes", desc: "Simulate 404s, 500s, 401s — anything.", Demo: StatusCodesDemo },
  { icon: Timer, title: "Response Delay", desc: "Add up to 3s of delay for loading states.", Demo: ResponseDelayDemo },
  { icon: Globe, title: "CORS Ready", desc: "Allow-any-origin headers built in.", Demo: CorsDemo },
  { icon: Database, title: "Persistent URLs", desc: "Endpoints survive page reloads.", Demo: PersistentUrlDemo },
];

export const Features = () => {
  const root = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const intensity = useScrollVelocity();
  const { ref: dotGridRef, inView } = useInView<HTMLDivElement>(0.05);

  // Heading word-by-word slide-up on viewport entry.
  useGSAP(
    () => {
      if (!headingRef.current) return;
      const words = headingRef.current.querySelectorAll<HTMLElement>(".h-word");
      gsap.set(words, { yPercent: 105, opacity: 0 });
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Eyebrow underline draws on entry.
      gsap.set(eyebrowRef.current, { onStart: () => eyebrowRef.current?.classList.add("is-visible") });
      gsap.to(eyebrowRef.current, {
        scrollTrigger: { trigger: eyebrowRef.current, start: "top 85%" },
        duration: 0.001,
        onStart: () => eyebrowRef.current?.classList.add("is-visible"),
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="features"
      className="relative py-24 md:py-32"
      style={{ background: "var(--features-bg)" }}
    >
      <div
        ref={dotGridRef}
        className={`dot-grid-bg pointer-events-none absolute inset-0 opacity-60 ${inView ? "" : "[animation-play-state:paused]"} ${intensity > 0.4 ? "is-fast" : ""}`}
        aria-hidden
      />

      <div className="container relative">
        <div className="mb-14 text-center">
          <span ref={eyebrowRef} className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--purple-electric)]">
            <AnimatedUnderline>Features</AnimatedUnderline>
          </span>
          <h2
            ref={headingRef}
            className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-white overflow-hidden"
          >
            {"Everything you need. Nothing you don't.".split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="h-word inline-block">{w}&nbsp;</span>
              </span>
            ))}
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const Demo = f.Demo;
            const fromLeft = i % 2 === 0;
            return (
              <motion.div
                key={f.title}
                variants={{
                  hidden: { opacity: 0, x: fromLeft ? -60 : 60 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { type: "spring", stiffness: 120, damping: 16 },
                  },
                }}
                whileHover={{ y: -10 }}
              >
                <CardShell title={f.title} desc={f.desc} icon={<Icon className="h-5 w-5" />}>
                  <Demo active={inView} />
                </CardShell>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const CardShell = ({
  title,
  desc,
  icon,
  children,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className="glow-border group h-full rounded-lg p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)]"
    style={{ ["--card-bg" as string]: "var(--features-bg)" }}
    data-cursor-hover
  >
    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--purple-electric)]/10 text-[var(--purple-electric)] transition-all">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-white">{title}</h3>
    <p className="text-sm text-white/50">{desc}</p>
    {children}
  </div>
);
