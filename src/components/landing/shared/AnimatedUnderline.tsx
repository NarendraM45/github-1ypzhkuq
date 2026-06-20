/** Shared underline primitive (Features eyebrow + Footer links, 4.5 / 4.9).
 *  `visible` toggles the viewport-triggered draw; hovering also draws it. */
export function AnimatedUnderline({
  children,
  visible = true,
  className = "",
}: {
  children: React.ReactNode;
  visible?: boolean;
  className?: string;
}) {
  return (
    <span className={`anim-underline ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </span>
  );
}
