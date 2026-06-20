import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { LiquidTransition } from "./LiquidTransition";
import { HowItWorks } from "./PipelineTube";
import { StatsCta } from "./StatsCta";
import { LandingFooter } from "./LandingFooter";
import { CustomCursor } from "./shared/CustomCursor";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export const Landing = () => {
  const featuresTop = useRef<HTMLElement>(null);
  const howTop = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  // Body background — landing is dark void throughout
  useEffect(() => {
    document.body.style.background = "var(--bg-void)";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  if (reduced) {
    return (
      <>
        <CustomCursor disabled />
        <Hero />
        <Features />
        <HowItWorks />
        <StatsCta />
        <LandingFooter />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <Hero />

      {/* Transition 1 — hero → features (liquid drain, downward, electric purple) */}
      <LiquidTransition triggerRef={featuresTop} color="var(--purple-electric)" direction="down" />
      <span ref={featuresTop as React.RefObject<HTMLSpanElement>} aria-hidden className="block" />
      <Features />

      {/* Transition 2 — features → how it works (liquid rise, upward, midnight blue) */}
      <LiquidTransition triggerRef={howTop} color="var(--blue-midnight)" direction="up" />
      <span ref={howTop as React.RefObject<HTMLSpanElement>} aria-hidden className="block" />
      <HowItWorks />

      <StatsCta />
      <LandingFooter />
    </>
  );
};
