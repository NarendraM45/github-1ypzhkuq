import { useEffect, useState } from "react";
import { useWorkspace } from "@/lib/mockdrop/workspace";
import { Inbox } from "lucide-react";

export const ActivityLog = () => {
  const { logs, endpoints, loading } = useWorkspace();
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShowSkeleton(false), 350);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const labelFor = (id: string) => endpoints.find((e) => e.id === id)?.label ?? id;
  const fmt = (ts: number) => new Date(ts).toLocaleTimeString();
  const maskIp = (ip: string) => {
    const p = ip.split(".");
    return p.length === 4 ? `${p[0]}.${p[1]}.x.x` : ip;
  };

  const visible = logs.slice(0, 10);

  return (
    <section id="activity" className="relative py-20 md:py-24">
      <div className="container">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">Live</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Recent Activity</h2>
            <p className="mt-2 text-sm text-muted-foreground">Every simulated request, locally tracked.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            {logs.length} total
          </div>
        </div>

        <div className="rounded-lg card-border bg-surface overflow-hidden">
          <div className="grid grid-cols-[1fr_1.4fr_0.7fr_1fr_0.8fr] gap-4 px-5 py-3 border-b border-white/5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Time</div>
            <div>Endpoint</div>
            <div>Status</div>
            <div>IP</div>
            <div className="text-right">Response</div>
          </div>

          {showSkeleton ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_0.7fr_1fr_0.8fr] gap-4 px-5 py-4">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div key={j} className="h-3 rounded bg-gradient-to-r from-elevated via-white/5 to-elevated bg-[length:200%_100%] animate-shimmer" />
                  ))}
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated text-muted-foreground/60 mb-4">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No requests yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Hit "Send" in the Try-it panel to see live activity here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {visible.map((l) => (
                <div key={l.id} className="grid grid-cols-[1fr_1.4fr_0.7fr_1fr_0.8fr] gap-4 px-5 py-3 text-sm items-center hover:bg-elevated/40 transition-colors animate-fade-in">
                  <div className="text-muted-foreground font-mono text-xs">{fmt(l.ts)}</div>
                  <div className="truncate">
                    <span className={`text-[10px] font-mono mr-2 px-1.5 py-0.5 rounded ${
                      l.method === "GET" ? "bg-success/15 text-success" :
                      l.method === "POST" ? "bg-accent/15 text-accent" :
                      "bg-elevated text-muted-foreground"
                    }`}>{l.method}</span>
                    <span className="text-sm">{labelFor(l.endpointId)}</span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono ${l.status < 400 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {l.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground font-mono text-xs">{maskIp(l.ip)}</div>
                  <div className="text-right font-mono text-xs">{l.responseTime}ms</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
