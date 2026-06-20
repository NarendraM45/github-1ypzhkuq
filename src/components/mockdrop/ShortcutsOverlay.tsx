import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Open command palette" },
  { keys: ["⌘", "↵"], desc: "Save endpoint" },
  { keys: ["⌘", "N"], desc: "New endpoint" },
  { keys: ["⌘", "D"], desc: "Duplicate endpoint" },
  { keys: ["⌘", "/"], desc: "Format JSON" },
  { keys: ["?"], desc: "Show this overlay" },
  { keys: ["Esc"], desc: "Close any modal" },
];

export const ShortcutsOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-lg card-border bg-elevated shadow-elevated p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Keyboard shortcuts</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-background text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.desc} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{s.desc}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="font-mono text-[11px] bg-background border border-border rounded px-1.5 py-0.5 min-w-[24px] text-center">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          On Windows/Linux, ⌘ = Ctrl
        </p>
      </div>
    </div>
  );
};
