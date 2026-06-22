import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const ROBOT_W = 52;
const RUN_MS = 1200;
const POINT_MS = 500;
const EXIT_MS = 800;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = {
  trackRef: React.RefObject<HTMLDivElement>;
  cardRefs: React.RefObject<HTMLDivElement>[];
  onPointCard: (index: number | null) => void;
};

export function RobotMascot({ trackRef, cardRefs, onPointCard }: Props) {
  const robotRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPointing, setIsPointing] = useState(false);
  const reduced = usePrefersReducedMotion();

  const trackRefStable = useRef(trackRef);
  const cardRefsStable = useRef(cardRefs);
  const onPointCardStable = useRef(onPointCard);
  trackRefStable.current = trackRef;
  cardRefsStable.current = cardRefs;
  onPointCardStable.current = onPointCard;

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;

    const cardCenterX = (i: number) => {
      const track = trackRefStable.current.current;
      const card = cardRefsStable.current[i]?.current;
      if (!track || !card) return 0;
      const t = track.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      return c.left + c.width / 2 - t.left - ROBOT_W / 2;
    };

    const trackWidth = () => trackRefStable.current.current?.getBoundingClientRect().width ?? 0;

    const pointAt = (index: number | null) => onPointCardStable.current(index);

    const jumpTo = (x: number) => {
      const el = robotRef.current;
      if (!el) return;
      el.style.transition = "none";
      el.style.left = `${x}px`;
      void el.offsetWidth;
    };

    const moveTo = (x: number, duration: number) => {
      const el = robotRef.current;
      if (!el) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = (e: TransitionEvent) => {
          if (e.propertyName !== "left") return;
          el.removeEventListener("transitionend", done);
          resolve();
        };
        el.addEventListener("transitionend", done);
        el.style.transition = `left ${duration}ms linear`;
        el.style.left = `${x}px`;
        setTimeout(resolve, duration + 80);
      });
    };

    const runLoop = async () => {
      await sleep(400);

      while (!cancelled) {
        jumpTo(0);
        setIsRunning(true);
        setIsPointing(false);
        pointAt(null);
        await sleep(50);

        for (let i = 0; i < 3; i++) {
          if (cancelled) return;

          await moveTo(cardCenterX(i), RUN_MS);

          setIsRunning(false);
          setIsPointing(true);
          pointAt(i);
          await sleep(POINT_MS);

          setIsPointing(false);
          pointAt(null);
          if (i < 2) setIsRunning(true);
        }

        setIsRunning(true);
        await moveTo(Math.max(0, trackWidth() - ROBOT_W), EXIT_MS);
        await sleep(200);
      }
    };

    runLoop();
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  if (reduced) return <div className="hiw-robot-track" aria-hidden />;

  return (
    <>
      <div className="hiw-robot-track" aria-hidden />
      <div
        ref={robotRef}
        className={`hiw-robot${isRunning ? " is-running" : ""}${isPointing ? " is-pointing" : ""}`}
        aria-hidden
      >
        <svg viewBox="0 0 52 56" width={ROBOT_W} height={56} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="4" width="24" height="20" rx="8" fill="#f0f0f5" stroke="#c8c8d4" strokeWidth="1.2" />
          <circle cx="22" cy="13" r="2.2" fill="#3a3a4a" />
          <circle cx="30" cy="13" r="2.2" fill="#3a3a4a" />
          <rect x="23" y="17" width="6" height="2" rx="1" fill="#b0b0be" />
          <rect x="12" y="24" width="28" height="18" rx="5" fill="#e8e8f0" stroke="#c8c8d4" strokeWidth="1.2" />
          <g className="hiw-robot-arm">
            <rect x="36" y="26" width="5" height="14" rx="2.5" fill="#d8d8e4" stroke="#b8b8c8" strokeWidth="1" />
          </g>
          <rect x="11" y="28" width="5" height="10" rx="2.5" fill="#d8d8e4" stroke="#b8b8c8" strokeWidth="1" />
          <rect className="hiw-robot-leg hiw-robot-leg-l" x="17" y="42" width="7" height="11" rx="2" fill="#d0d0dc" stroke="#b0b0be" strokeWidth="1" />
          <rect className="hiw-robot-leg hiw-robot-leg-r" x="28" y="42" width="7" height="11" rx="2" fill="#d0d0dc" stroke="#b0b0be" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}
