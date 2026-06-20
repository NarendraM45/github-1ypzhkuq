import { useEffect, useState } from "react";
import { Navbar } from "@/components/mockdrop/Navbar";
import { Hero } from "@/components/mockdrop/Hero";
import { Editor } from "@/components/mockdrop/Editor";
import { HowItWorks } from "@/components/mockdrop/HowItWorks";
import { Features } from "@/components/mockdrop/Features";
import { ActivityLog } from "@/components/mockdrop/ActivityLog";
import { Footer } from "@/components/mockdrop/Footer";
import { EndpointSidebar } from "@/components/mockdrop/EndpointSidebar";
import { CommandPalette } from "@/components/mockdrop/CommandPalette";
import { ShortcutsOverlay } from "@/components/mockdrop/ShortcutsOverlay";
import { WorkspaceProvider } from "@/lib/mockdrop/workspace";

const IndexInner = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <div className="flex flex-1 pt-16">
        <EndpointSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
        <main className="flex-1 min-w-0">
          <Hero />
          <Editor />
          <HowItWorks />
          <Features />
          <ActivityLog />
          <Footer />
        </main>
      </div>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
};

const Index = () => (
  <WorkspaceProvider>
    <IndexInner />
  </WorkspaceProvider>
);

export default Index;
