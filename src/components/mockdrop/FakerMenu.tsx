import { TEMPLATES, generateTemplate, type Template } from "@/lib/mockdrop/faker";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const FakerMenu = ({ onInsert }: { onInsert: (json: string) => void }) => {
  const [open, setOpen] = useState(false);

  const insert = (t: Template) => {
    const data = generateTemplate(t);
    onInsert(JSON.stringify(data, null, 2));
    toast.success("Sample data generated");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-primary-glow hover:bg-primary/10 transition-colors font-medium"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate sample
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg card-border bg-elevated shadow-elevated p-1 animate-scale-in origin-top-right">
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Templates
            </p>
            <div className="max-h-80 overflow-y-auto">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => insert(t.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors group"
                >
                  <p className="text-sm font-medium group-hover:text-primary-glow transition-colors">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
