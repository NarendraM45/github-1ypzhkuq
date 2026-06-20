import { Link } from "react-router-dom";
import { AnimatedUnderline } from "./shared/AnimatedUnderline";

export function LandingFooter() {
  return (
    <footer className="relative" style={{ background: "var(--bg-void)" }}>
      <div className="footer-sweep h-px w-full" aria-hidden />

      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <img src="/logo.png" alt="MockDrop" className="h-6 w-6 object-contain footer-wordmark" />
          <span>
            <span className="font-semibold text-white">MockDrop</span> · Built on LAMP · Free forever
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <AnimatedUnderline>Documentation</AnimatedUnderline>
          </a>
          <a href="https://github.com/NarendraM45/mockdrop-api-gen.git" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
            <AnimatedUnderline>GitHub</AnimatedUnderline>
          </a>
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <AnimatedUnderline>Report a Bug</AnimatedUnderline>
          </a>
          <Link to="/developers" className="text-white/60 hover:text-white transition-colors">
            <AnimatedUnderline>Devs</AnimatedUnderline>
          </Link>
        </div>
      </div>

      <style>{`
        .footer-wordmark:hover { filter: drop-shadow(0 0 8px rgba(168,85,247,0.6)); opacity: 0.85; }
      `}</style>
    </footer>
  );
}
