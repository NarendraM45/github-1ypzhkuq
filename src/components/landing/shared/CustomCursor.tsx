import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Site-wide custom cursor. One fixed div, one mousemove listener.
 *  Disabled on touch / coarse pointers via CSS. */
export function CustomCursor({ disabled }: { disabled?: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const el = cursorRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.3, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, [data-cursor-hover]")) {
        el.classList.add("is-hover");
      }
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, [data-cursor-hover]")) {
        el.classList.remove("is-hover");
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [disabled]);

  if (disabled) return null;
  return <div ref={cursorRef} className="landing-cursor" aria-hidden />;
}
