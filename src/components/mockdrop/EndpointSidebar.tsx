import { useState } from "react";
import { useWorkspace } from "@/lib/mockdrop/workspace";
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
  Download,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";

export const EndpointSidebar = ({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) => {
  const {
    endpoints,
    activeId,
    selectEndpoint,
    createEndpoint,
    duplicateEndpoint,
    deleteEndpoint,
    upsertEndpoint,
    exportData,
    importData,
  } = useWorkspace();

  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");

  const filtered = endpoints.filter((e) =>
    e.label.toLowerCase().includes(query.toLowerCase()) || e.id.includes(query.toLowerCase())
  );

  const startRename = (id: string, label: string) => {
    setEditingId(id);
    setDraftLabel(label);
  };

  const commitRename = async () => {
    const e = endpoints.find((x) => x.id === editingId);
    if (e && draftLabel.trim()) {
      await upsertEndpoint({ ...e, label: draftLabel.trim() });
    }
    setEditingId(null);
  };

  const onImport = (file?: File) => {
    if (file) importData(file);
  };

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col items-center gap-2 w-14 shrink-0 border-r border-border bg-surface/50 py-4">
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-elevated text-muted-foreground hover:text-foreground"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <button
          onClick={() => createEndpoint()}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground"
          title="New endpoint"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="mt-2 flex flex-col gap-1.5 w-full px-2">
          {endpoints.slice(0, 8).map((e) => (
            <button
              key={e.id}
              onClick={() => selectEndpoint(e.id)}
              title={e.label}
              className={`h-9 w-9 mx-auto flex items-center justify-center rounded-md text-xs font-mono ${
                activeId === e.id ? "bg-primary/20 text-primary-glow" : "bg-elevated text-muted-foreground hover:text-foreground"
              }`}
            >
              {e.label.slice(0, 1).toUpperCase()}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border bg-surface/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-primary-glow" />
          <h3 className="text-sm font-semibold">Endpoints</h3>
          <span className="text-[10px] font-mono text-muted-foreground rounded-full bg-elevated px-1.5 py-0.5">
            {endpoints.length}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-elevated text-muted-foreground hover:text-foreground"
          title="Collapse"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-2 border-b border-border">
        <button
          onClick={() => createEndpoint()}
          className="btn-primary w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> New endpoint
        </button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md card-border bg-elevated pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No endpoints match.</p>
        )}
        {filtered.map((e) => {
          const isActive = e.id === activeId;
          const isEditing = e.id === editingId;
          return (
            <div
              key={e.id}
              onClick={() => !isEditing && selectEndpoint(e.id)}
              className={`group rounded-md p-2.5 cursor-pointer transition-all ${
                isActive
                  ? "bg-primary/15 border border-primary/30"
                  : "border border-transparent hover:bg-elevated"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
                      <input
                        autoFocus
                        value={draftLabel}
                        onChange={(ev) => setDraftLabel(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") commitRename();
                          if (ev.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 min-w-0 rounded bg-background px-1.5 py-0.5 text-sm outline-none border border-primary/50"
                      />
                      <button onClick={commitRename} className="p-1 rounded hover:bg-elevated text-success">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-elevated text-muted-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{e.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          e.method === "GET" ? "bg-success/15 text-success" :
                          e.method === "POST" ? "bg-accent/15 text-accent" :
                          e.method === "DELETE" ? "bg-destructive/15 text-destructive" :
                          "bg-elevated text-muted-foreground"
                        }`}>
                          {e.method}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">/{e.id}</span>
                      </div>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <IconBtn onClick={(ev) => { ev.stopPropagation(); startRename(e.id, e.label); }} title="Rename">
                      <Pencil className="h-3 w-3" />
                    </IconBtn>
                    <IconBtn onClick={(ev) => { ev.stopPropagation(); duplicateEndpoint(e.id); toast("Duplicated"); }} title="Duplicate">
                      <Copy className="h-3 w-3" />
                    </IconBtn>
                    <IconBtn
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (confirm(`Delete "${e.label}"?`)) deleteEndpoint(e.id);
                      }}
                      title="Delete"
                      destructive
                    >
                      <Trash2 className="h-3 w-3" />
                    </IconBtn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border flex items-center gap-2">
        <button
          onClick={exportData}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md card-border bg-elevated px-2 py-1.5 text-xs hover:bg-elevated/70"
          title="Export backup"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
        <label className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md card-border bg-elevated px-2 py-1.5 text-xs hover:bg-elevated/70 cursor-pointer" title="Import backup">
          <Upload className="h-3.5 w-3.5" /> Import
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(ev) => onImport(ev.target.files?.[0])}
          />
        </label>
      </div>
    </aside>
  );
};

const IconBtn = ({
  children,
  onClick,
  title,
  destructive,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  destructive?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1 rounded hover:bg-background ${
      destructive ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);
