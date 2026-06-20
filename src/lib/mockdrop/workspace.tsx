import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { store, newId, type Endpoint, type RequestLog } from "@/lib/mockdrop/store";
import { parseShareHash } from "@/lib/mockdrop/share";
import { createEndpointOnBackend, isBackendHash } from "@/lib/api";
import { toast } from "sonner";

type Ctx = {
  endpoints: Endpoint[];
  logs: RequestLog[];
  activeId: string | null;
  active: Endpoint | null;
  loading: boolean;
  selectEndpoint: (id: string | null) => void;
  upsertEndpoint: (e: Endpoint, captchaToken?: string) => Promise<void>;
  createEndpoint: (partial?: Partial<Endpoint>) => Promise<Endpoint>;
  duplicateEndpoint: (id: string) => Promise<Endpoint | null>;
  deleteEndpoint: (id: string) => Promise<void>;
  addLog: (l: RequestLog) => Promise<void>;
  refreshLogs: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
};

const WorkspaceCtx = createContext<Ctx | null>(null);

const DEFAULT_PAYLOAD = `{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "admin",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "createdAt": "2026-04-01T12:00:00Z"
}`;

const blank = (overrides: Partial<Endpoint> = {}): Endpoint => {
  const id = newId();
  const now = Date.now();
  return {
    id,
    label: "Untitled endpoint",
    payload: DEFAULT_PAYLOAD,
    status: 200,
    expiry: "Never",
    delay: 0,
    cors: true,
    method: "GET",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await store.listEndpoints();
    setEndpoints(list);
    return list;
  }, []);

  const refreshLogs = useCallback(async () => {
    const list = await store.listLogs(undefined, 200);
    setLogs(list);
  }, []);

  // Initial load + share-hash import
  useEffect(() => {
    (async () => {
      const ensureOnBackend = async (e: Endpoint): Promise<Endpoint> => {
        const updatedAt = Date.now();
        try {
          const data = await createEndpointOnBackend(e);
          const hash = data.hash ?? e.id;

          // If the backend returns a different hash, remove the old local record/logs.
          if (hash !== e.id) await store.deleteEndpoint(e.id);

          const next = { ...e, id: hash, updatedAt };
          await store.saveEndpoint(next);
          return next;
        } catch (err) {
          toast.error("Failed to create endpoint on backend");
          // Keep the UI usable by falling back to local storage.
          const next = { ...e, updatedAt };
          await store.saveEndpoint(next);
          return next;
        }
      };

      let list = await refresh();

      const shared = parseShareHash();
      if (shared) {
        const e = blank({ ...shared, label: shared.label || "Shared endpoint" });
        const saved = await ensureOnBackend(e);
        history.replaceState(null, "", window.location.pathname);
        await refresh();
        await refreshLogs();
        setActiveId(saved.id);
        toast.success("Shared endpoint imported!");
        setLoading(false);
        return;
      }

      if (list.length === 0) {
        const e = blank();
        const saved = await ensureOnBackend(e);
        await refresh();
        await refreshLogs();
        setActiveId(saved.id);
      } else {
        // Hydrate any endpoints that were created by an older frontend version.
        const invalid = list.filter((x) => !isBackendHash(x.id));
        if (invalid.length) {
          for (const e of invalid) {
            await ensureOnBackend(e);
          }
          list = await refresh();
        }
        setActiveId(list[0]?.id ?? null);
        await refreshLogs();
      }
      setLoading(false);
    })();
  }, [refresh, refreshLogs]);

  const upsertEndpoint = useCallback(async (e: Endpoint, captchaToken?: string) => {
    const updatedAt = Date.now();
    try {
      const data = await createEndpointOnBackend(e, captchaToken);
      const hash = data.hash ?? e.id;

      if (hash !== e.id) await store.deleteEndpoint(e.id);

      const updated = { ...e, id: hash, updatedAt };
      await store.saveEndpoint(updated);
      await refresh();

      if (activeId === e.id) setActiveId(hash);
    } catch {
      // Keep the endpoint editable even if the backend fails.
      toast.error("Failed to create endpoint on backend");
      const updated = { ...e, updatedAt };
      await store.saveEndpoint(updated);
      await refresh();
    }
  }, [refresh, activeId]);

  const createEndpoint = useCallback(async (partial: Partial<Endpoint> = {}) => {
    const e = blank(partial);
    const updatedAt = Date.now();
    let id = e.id;
    try {
      const data = await createEndpointOnBackend(e);
      id = data.hash ?? id;
    } catch {
      toast.error("Failed to create endpoint on backend");
    }

    const saved = { ...e, id, updatedAt };
    if (id !== e.id) await store.deleteEndpoint(e.id);

    await store.saveEndpoint(saved);
    await refresh();
    setActiveId(saved.id);
    return saved;
  }, [refresh]);

  const duplicateEndpoint = useCallback(async (id: string) => {
    const src = await store.getEndpoint(id);
    if (!src) return null;
    const dup = blank({ ...src, id: newId(), label: `${src.label} (copy)`, createdAt: Date.now() });

    const updatedAt = Date.now();
    let nextId = dup.id;
    try {
      const data = await createEndpointOnBackend(dup);
      nextId = data.hash ?? nextId;
    } catch {
      toast.error("Failed to create endpoint on backend");
    }

    const saved = { ...dup, id: nextId, updatedAt };
    await store.saveEndpoint(saved);
    await refresh();
    setActiveId(saved.id);
    return saved;
  }, [refresh]);

  const deleteEndpoint = useCallback(async (id: string) => {
    await store.deleteEndpoint(id);
    const list = await refresh();
    if (activeId === id) setActiveId(list[0]?.id ?? null);
    await refreshLogs();
  }, [refresh, refreshLogs, activeId]);

  const addLog = useCallback(async (l: RequestLog) => {
    await store.addLog(l);
    await refreshLogs();
  }, [refreshLogs]);

  const exportData = useCallback(async () => {
    const data = await store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mockdrop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }, []);

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await store.importAll(parsed);
      await refresh();
      await refreshLogs();
      toast.success(`Imported ${res.endpoints} endpoints, ${res.logs} logs`);
    } catch {
      toast.error("Invalid backup file");
    }
  }, [refresh, refreshLogs]);

  const active = endpoints.find((e) => e.id === activeId) ?? null;

  return (
    <WorkspaceCtx.Provider
      value={{
        endpoints,
        logs,
        activeId,
        active,
        loading,
        selectEndpoint: setActiveId,
        upsertEndpoint,
        createEndpoint,
        duplicateEndpoint,
        deleteEndpoint,
        addLog,
        refreshLogs,
        exportData,
        importData,
      }}
    >
      {children}
    </WorkspaceCtx.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
