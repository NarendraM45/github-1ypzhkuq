import { type ReactNode } from "react";

/** Reusable rotating conic-gradient border. Apply `.glow-border` inline via this
 *  wrapper. The `cardBg` prop drives the inner ::after background. */
export function GlowBorder({
  children,
  className = "",
  cardBg = "var(--bg-void)",
}: {
  children: ReactNode;
  className?: string;
  cardBg?: string;
}) {
  return (
    <div
      className={`glow-border ${className}`}
      style={{ ["--card-bg" as string]: cardBg }}
      data-cursor-hover
    >
      {children}
    </div>
  );
}
