import { Github, Menu, X, Search, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = ({ onOpenPalette }: { onOpenPalette?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac/i.test(navigator.platform));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 glass transition-all ${
        scrolled ? "py-2.5" : "py-4"
      }`}
    >
      <div className="container flex items-center justify-between gap-4">
        <button onClick={() => scrollTo("top")} className="flex items-center gap-2 group shrink-0">
          <img src="/logo.png" alt="MockDrop Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold tracking-tight">MockDrop</span>
        </button>

        {onOpenPalette && (
          <button
            onClick={onOpenPalette}
            className="hidden md:flex items-center gap-2 flex-1 max-w-sm rounded-md card-border bg-elevated/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-elevated hover:border-primary/30 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search or run a command…</span>
            <kbd className="font-mono bg-background border border-border rounded px-1.5 py-0.5 text-[10px]">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>
        )}

        <nav className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/NarendraM45/mockdrop-api-gen.git"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>

          <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Free Forever
          </span>

          <Link
            to="/developers"
            className="ml-1 flex items-center gap-1.5 rounded-md border border-border bg-elevated/80 px-3 py-2 text-sm font-semibold text-foreground hover:bg-elevated hover:border-primary/40 hover:shadow-elevated transition-all"
          >
            <Users className="h-4 w-4 text-primary" />
            Devs
          </Link>

          <button
            onClick={() => scrollTo("editor")}
            className="ml-1 btn-primary rounded-md px-4 py-2 text-sm font-semibold"
          >
            Get Started
          </button>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md hover:bg-elevated"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden container mt-3 pb-3 flex flex-col gap-1 animate-fade-in">
          {onOpenPalette && (
            <button onClick={() => { onOpenPalette(); setOpen(false); }} className="text-left px-3 py-2 rounded-md hover:bg-elevated text-sm flex items-center gap-2">
              <Search className="h-4 w-4" /> Command palette
            </button>
          )}
          <button onClick={() => scrollTo("how-it-works")} className="text-left px-3 py-2 rounded-md hover:bg-elevated text-sm">
            How it works
          </button>
          <button onClick={() => scrollTo("features")} className="text-left px-3 py-2 rounded-md hover:bg-elevated text-sm">
            Features
          </button>
          <Link
            to="/developers"
            onClick={() => setOpen(false)}
            className="px-3 py-2 rounded-md hover:bg-elevated text-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" /> Devs
          </Link>
          <a href="https://github.com/NarendraM45/mockdrop-api-gen.git" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md hover:bg-elevated text-sm flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <button onClick={() => scrollTo("editor")} className="btn-primary mt-2 rounded-md px-4 py-2 text-sm font-semibold">
            Get Started
          </button>
        </div>
      )}
    </header>
  );
};
