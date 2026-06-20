import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileJson,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Copy,
  Keyboard,
  HelpCircle,
} from "lucide-react";
import { useWorkspace } from "@/lib/mockdrop/workspace";
import { TEMPLATES, generateTemplate } from "@/lib/mockdrop/faker";
import { toast } from "sonner";

export const CommandPalette = ({
  open,
  onOpenChange,
  onShowShortcuts,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onShowShortcuts: () => void;
}) => {
  const {
    endpoints,
    selectEndpoint,
    createEndpoint,
    duplicateEndpoint,
    deleteEndpoint,
    upsertEndpoint,
    active,
    exportData,
  } = useWorkspace();

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const close = () => onOpenChange(false);

  const insertTemplate = async (id: string) => {
    if (!active) return;
    const data = generateTemplate(id as Parameters<typeof generateTemplate>[0]);
    await upsertEndpoint({ ...active, payload: JSON.stringify(data, null, 2) });
    toast.success("Sample inserted");
    close();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-fade-in"
      onClick={close}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-lg card-border bg-elevated shadow-elevated overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" className="bg-transparent">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search endpoints…"
              className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results.
            </Command.Empty>

            <Command.Group heading="Actions" className="text-[10px] uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              <Item icon={<Plus className="h-4 w-4" />} onSelect={() => { createEndpoint(); close(); }}>
                New endpoint
              </Item>
              {active && (
                <Item icon={<Copy className="h-4 w-4" />} onSelect={() => { duplicateEndpoint(active.id); close(); }}>
                  Duplicate current endpoint
                </Item>
              )}
              {active && (
                <Item
                  icon={<Trash2 className="h-4 w-4" />}
                  onSelect={() => {
                    if (confirm(`Delete "${active.label}"?`)) { deleteEndpoint(active.id); close(); }
                  }}
                  destructive
                >
                  Delete current endpoint
                </Item>
              )}
              <Item icon={<Download className="h-4 w-4" />} onSelect={() => { exportData(); close(); }}>
                Export backup
              </Item>
              <Item
                icon={<Upload className="h-4 w-4" />}
                onSelect={() => {
                  const i = document.createElement("input");
                  i.type = "file";
                  i.accept = "application/json";
                  i.onchange = () => {
                    const f = i.files?.[0];
                    if (f) import("@/lib/mockdrop/store").then(({ store }) => store.importAll(JSON.parse("{}")).then(() => {}));
                    if (f) f.text().then((t) => {
                      try {
                        const data = JSON.parse(t);
                        import("@/lib/mockdrop/store").then(({ store }) =>
                          store.importAll(data).then(() => window.location.reload())
                        );
                      } catch {
                        toast.error("Invalid backup file");
                      }
                    });
                  };
                  i.click();
                  close();
                }}
              >
                Import backup
              </Item>
              <Item icon={<Keyboard className="h-4 w-4" />} onSelect={() => { onShowShortcuts(); close(); }}>
                Show keyboard shortcuts
              </Item>
            </Command.Group>

            <Command.Group heading="Insert sample data" className="text-[10px] uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold mt-2">
              {TEMPLATES.map((t) => (
                <Item key={t.id} icon={<Sparkles className="h-4 w-4" />} onSelect={() => insertTemplate(t.id)}>
                  {t.name}
                  <span className="ml-auto text-[10px] text-muted-foreground">{t.description}</span>
                </Item>
              ))}
            </Command.Group>

            <Command.Group heading="Endpoints" className="text-[10px] uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold mt-2">
              {endpoints.map((e) => (
                <Item
                  key={e.id}
                  icon={<FileJson className="h-4 w-4" />}
                  onSelect={() => { selectEndpoint(e.id); close(); }}
                >
                  {e.label}
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground">/{e.id}</span>
                </Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-3 w-3" />
              Press <kbd className="font-mono bg-background px-1 rounded">?</kbd> for shortcuts
            </div>
            <div>
              <kbd className="font-mono bg-background px-1 rounded">↵</kbd> select
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
};

const Item = ({
  children,
  onSelect,
  icon,
  destructive,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon: React.ReactNode;
  destructive?: boolean;
}) => (
  <Command.Item
    onSelect={onSelect}
    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-primary/15 aria-selected:text-foreground transition-colors ${
      destructive ? "text-muted-foreground aria-selected:text-destructive" : "text-foreground"
    }`}
  >
    <span className="text-muted-foreground">{icon}</span>
    {children}
  </Command.Item>
);
