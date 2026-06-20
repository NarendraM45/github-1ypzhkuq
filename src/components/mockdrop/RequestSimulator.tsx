import { useState } from "react";
import { Play, Loader2, Trash2, BarChart3, Wifi } from "lucide-react";
import type { Endpoint } from "@/lib/mockdrop/store";
import { newId, endpointUrl } from "@/lib/mockdrop/store";
import { useWorkspace } from "@/lib/mockdrop/workspace";
import { faker } from "@/lib/mockdrop/faker";
import { toast } from "sonner";

export const RequestSimulator = ({ endpoint }: { endpoint: Endpoint }) => {
  const { logs, addLog, refreshLogs } = useWorkspace();
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<{ status: number; body: string; ms: number } | null>(null);

  const endpointLogs = logs.filter((l) => l.endpointId === endpoint.id).slice(0, 20);

  const send = async () => {
    setRunning(true);
    setResponse(null);
    const start = performance.now();
    await new Promise((r) => setTimeout(r, endpoint.delay + Math.random() * 80 + 20));
    const ms = Math.round(performance.now() - start);
    let body = endpoint.payload;
    try {
      body = JSON.stringify(JSON.parse(endpoint.payload), null, 2);
    } catch {
      body = "// Invalid JSON in payload";
    }
    setResponse({ status: endpoint.status, body, ms });
    await addLog({
      id: newId(),
      endpointId: endpoint.id,
      ts: Date.now(),
      method: endpoint.method,
      status: endpoint.status,
      ip: faker.ip(),
      responseTime: ms,
    });
    setRunning(false);
  };

  // Tiny inline timing chart (sparkline)
  const maxRt = Math.max(...endpointLogs.map((l) => l.responseTime), 100);
  const points = endpointLogs.slice().reverse();

  return (
    <div className="rounded-lg card-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Try it</h3>
          <span className="text-[11px] text-muted-foreground">Simulate a real request</span>
        </div>
        <button
          onClick={async () => {
            const { store } = await import("@/lib/mockdrop/store");
            await store.clearLogs(endpoint.id);
            await refreshLogs();
            toast("History cleared");
          }}
          className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" /> Clear history
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 rounded-md card-border bg-[#0d1117] p-2">
          <span className={`text-[11px] font-mono font-semibold px-2 py-1 rounded ${
            endpoint.method === "GET" ? "bg-success/15 text-success" :
            endpoint.method === "POST" ? "bg-accent/15 text-accent" :
            endpoint.method === "DELETE" ? "bg-destructive/15 text-destructive" :
            "bg-elevated text-muted-foreground"
          }`}>
            {endpoint.method}
          </span>
          <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
            {endpointUrl(endpoint.id)}
          </code>
          <button
            onClick={send}
            disabled={running}
            className="btn-primary inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
            Send
          </button>
        </div>

        {response && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                response.status < 400 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}>
                {response.status}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{response.ms}ms</span>
            </div>
            <pre className="rounded-md card-border bg-[#0d1117] p-3 text-xs font-mono overflow-x-auto max-h-56 overflow-y-auto">
              {response.body}
            </pre>
          </div>
        )}

        {/* Timing chart */}
        {endpointLogs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Response times (last {endpointLogs.length})
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                avg {Math.round(endpointLogs.reduce((s, l) => s + l.responseTime, 0) / endpointLogs.length)}ms
              </span>
            </div>
            <div className="flex items-end gap-1 h-16 rounded-md bg-[#0d1117] p-2">
              {points.map((l, i) => {
                const h = Math.max(4, (l.responseTime / maxRt) * 100);
                const ok = l.status < 400;
                return (
                  <div
                    key={l.id}
                    title={`${l.responseTime}ms · ${l.status}`}
                    className={`flex-1 min-w-[4px] rounded-sm transition-all hover:opacity-80 ${
                      ok ? "bg-gradient-to-t from-primary/60 to-primary-glow" : "bg-destructive/70"
                    }`}
                    style={{ height: `${h}%`, animation: `fade-in 0.4s ease-out both`, animationDelay: `${i * 20}ms` }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
