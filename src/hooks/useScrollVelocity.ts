import { useEffect, useRef, useState } from "react";

const raf = (fn: () => void) => {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn();
    });
  };
};

/** Tracks scroll velocity (px per ms) and exposes a 0..1 intensity value that
 *  eases back to 0 when scrolling stops. Used to speed up the dot-grid drift. */
export function useScrollVelocity() {
  const [intensity, setIntensity] = useState(0);
  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const lastT = useRef(performance.now());
  const decayTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = raf(() => {
      const now = performance.now();
      const dy = window.scrollY - lastY.current;
      const dt = Math.max(1, now - lastT.current);
      lastY.current = window.scrollY;
      lastT.current = now;

      const v = Math.abs(dy) / dt; // px/ms
      const mapped = Math.min(1, v / 2); // 2px/ms => full intensity
      setIntensity(mapped);

      if (decayTimer.current) window.clearTimeout(decayTimer.current);
      decayTimer.current = window.setTimeout(() => setIntensity(0), 180);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return intensity;
}
