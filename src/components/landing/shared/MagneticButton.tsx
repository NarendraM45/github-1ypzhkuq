import { useRef, type ReactNode, type MouseEvent } from "react";
import gsap from "gsap";

type Props = {
  children: ReactNode;
  /** Radius within which the magnetic pull is active (px). */
  radius?: number;
  /** Maximum displacement from center (px). */
  maxDisplacement?: number;
  /** Return easing when mouse leaves. */
  ease?: string;
  className?: string;
  /** Render as a different element. */
  as?: "button" | "a" | "div";
  href?: string;
  onClick?: () => void;
  "data-cursor-hover"?: boolean;
};

export function MagneticButton({
  children,
  radius = 80,
  maxDisplacement = 12,
  ease = "elastic.out(1, 0.5)",
  className = "",
  as = "button",
  href,
  onClick,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) return;
    const factor = 1 - dist / radius;
    const x = (dx / radius) * maxDisplacement * factor;
    const y = (dy / radius) * maxDisplacement * factor;
    gsap.to(el, { x, y, duration: 0.3, ease: "power3.out" });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease });
  };

  const commonProps = {
    ref: ref as any,
    className,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick,
    "data-cursor-hover": true,
  };

  if (as === "a") return <a href={href} {...commonProps}>{children}</a>;
  if (as === "div") return <div {...commonProps}>{children}</div>;
  return <button type="button" {...commonProps}>{children}</button>;
}
