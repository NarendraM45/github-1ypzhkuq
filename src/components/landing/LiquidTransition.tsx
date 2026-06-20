import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Direction = "down" | "up";

type Props = {
  /** Section id this transition precedes (used for trigger scoping). */
  triggerRef: React.RefObject<HTMLElement>;
  /** Color that drains in. */
  color: string;
  direction: Direction;
};

/** Reusable liquid transition. Drives an SVG path morph between a wavy shape
 *  and a full-coverage rectangle, plus a subtle feDisplacementMap filter.
 *  Direction "down" drains the previous section downward (hero→features);
 *  "up" rises the wave upward (features→how). Props only differ — same system. */
export function LiquidTransition({ triggerRef, color, direction }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 2,
        },
      });

      // path morph: wave → rect (down) / wave-inverted → rect (up)
      const path = root.current?.querySelector("path");
      const fill = root.current;
      if (!path || !fill) return;

      const wave =
        direction === "down"
          ? "M0,0 L200,0 Q100,15 0,30 L0,100 L200,100 Z"
          : "M0,100 L200,100 Q100,85 0,70 L0,0 L200,0 Z";
      const rect =
        direction === "down"
          ? "M0,0 L200,0 L0,100 L200,100 Z"
          : "M0,0 L200,0 L0,100 L200,100 Z";

      // Animate a simple progress and set the path via the d attribute.
      const obj = { p: 0 };
      tl.to(obj, {
        p: 1,
        ease: "sine.inOut",
        onUpdate: () => {
          const v = obj.p;
          // Interpolate between wave and rect by toggling d at midpoint.
          if (v > 0.5) {
            path.setAttribute("d", rect);
            fill.style.opacity = "1";
          } else {
            path.setAttribute("d", wave);
            fill.style.opacity = String(0.4 + v * 0.6);
          }
        },
      });
    },
    { scope: root, dependencies: [direction] }
  );

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-x-0 h-24 overflow-hidden"
      style={{ [direction === "down" ? "bottom" : "top"]: 0 } as React.CSSProperties}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id={`liquid-${direction}`}>
            <feDisplacementMap in="SourceGraphic" scale="20" />
          </filter>
        </defs>
        <path
          d={direction === "down" ? "M0,0 L200,0 Q100,15 0,30 L0,100 L200,100 Z" : "M0,100 L200,100 Q100,85 0,70 L0,0 L200,0 Z"}
          fill={color}
          filter={`url(#liquid-${direction})`}
        />
      </svg>
    </div>
  );
}
