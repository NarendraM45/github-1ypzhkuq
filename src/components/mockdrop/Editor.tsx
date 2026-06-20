import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Wand2,
  Trash2,
  FileCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  Check,
  QrCode,
  Info,
  Share2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useWorkspace } from "@/lib/mockdrop/workspace";
import { endpointUrl } from "@/lib/mockdrop/store";
import { buildShareUrl } from "@/lib/mockdrop/share";
import { MonacoJsonEditor } from "./MonacoJsonEditor";
import { FakerMenu } from "./FakerMenu";
import { RequestSimulator } from "./RequestSimulator";
import { SnippetPanel } from "./SnippetPanel";

const TURNSTILE_SITE_KEY = "0x4AAAAAADnVE1U-8NhbmbyR";

const HAS_CELEBRATED_KEY = "mockdrop:celebrated";

type Validation = { valid: boolean; message: string; line?: number };

function quickValidate(input: string): Validation {
  if (!input.trim()) return { valid: false, message: "Empty payload" };
  try {
    JSON.parse(input);
    return { valid: true, message: "Valid JSON" };
  } catch (err) {
    const msg = (err as Error).message;
    const m = msg.match(/position (\d+)/);
    let line: number | undefined;
    if (m) {
      const pos = parseInt(m[1], 10);
      line = input.slice(0, pos).split("\n").length;
    }
    return { valid: false, message: line ? `Invalid JSON — line ${line}` : "Invalid JSON", line };
  }
}

export const Editor = () => {
  const { active, upsertEndpoint, createEndpoint } = useWorkspace();

  // Local draft so user can edit without thrashing IDB
  const [draft, setDraft] = useState(active);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const lastActiveId = useRef<string | null>(null);

  // Turnstile
  const turnstileRef = useRef<TurnstileInstance>(null);
  const captchaToken = useRef<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);

  const onTurnstileSuccess = useCallback((token: string) => {
    captchaToken.current = token;
    setCaptchaReady(true);
  }, []);

  const onTurnstileExpire = useCallback(() => {
    captchaToken.current = null;
    setCaptchaReady(false);
    turnstileRef.current?.reset();
  }, []);

  // Sync draft when active endpoint changes
  useEffect(() => {
    if (active && active.id !== lastActiveId.current) {
      setDraft(active);
      setDirty(false);
      lastActiveId.current = active.id;
    }
  }, [active]);

  const validation = useMemo(
    () => (draft ? quickValidate(draft.payload) : { valid: false, message: "No endpoint" }),
    [draft?.payload]
  );

  const update = <K extends keyof typeof draft & string>(key: K, value: NonNullable<typeof draft>[K]) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
    setDirty(true);
  };

  const save = async () => {
    if (!draft || !validation.valid) {
      toast.error("Fix JSON before saving");
      return;
    }
    if (!captchaToken.current) {
      toast.error("CAPTCHA not verified yet — please wait a moment");
      turnstileRef.current?.reset();
      return;
    }
    setSaving(true);
    await upsertEndpoint(draft, captchaToken.current);
    // Reset turnstile so next save gets a fresh token
    captchaToken.current = null;
    setCaptchaReady(false);
    turnstileRef.current?.reset();
    setDirty(false);
    setSaving(false);

    // Celebrate first save ever
    try {
      if (!localStorage.getItem(HAS_CELEBRATED_KEY)) {
        localStorage.setItem(HAS_CELEBRATED_KEY, "1");
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7c3aed", "#a855f7", "#06b6d4", "#10b981"],
        });
        toast.success("First endpoint saved! 🎉");
      } else {
        toast.success("Endpoint saved");
      }
    } catch {
      toast.success("Endpoint saved");
    }
  };

  // Cmd/Ctrl + Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createEndpoint();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, validation.valid]);

  if (!draft) {
    return (
      <section id="editor" className="container py-16">
        <div className="rounded-lg card-border bg-surface p-10 text-center text-muted-foreground">
          No endpoint selected.
        </div>
      </section>
    );
  }

  const handleFormat = () => {
    try {
      update("payload", JSON.stringify(JSON.parse(draft.payload), null, 2));
      toast.success("JSON formatted");
    } catch {
      toast.error("Cannot format invalid JSON");
    }
  };

  const handleClear = () => update("payload", "");

  const handleLoadExample = () => {
    update("payload", JSON.stringify({ message: "Hello from MockDrop", timestamp: new Date().toISOString() }, null, 2));
    toast("Example payload loaded");
  };

  const handleShare = async () => {
    const url = buildShareUrl(draft);
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  const url = endpointUrl(draft.id);

  return (
    <section id="editor" className="relative pt-10 pb-16 md:pt-12 md:pb-20">
      <div className="container">
        {/* Endpoint header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <input
              value={draft.label}
              onChange={(e) => update("label", e.target.value)}
              className="bg-transparent text-xl md:text-2xl font-bold tracking-tight outline-none border-b border-transparent hover:border-border focus:border-primary/50 transition-colors min-w-0 flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            {dirty && <span className="text-[11px] text-muted-foreground italic">unsaved changes</span>}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-md card-border bg-elevated px-3 py-2 text-xs hover:bg-elevated/70"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            {/* Hidden Turnstile widget — invisible to user, fires onTurnstileSuccess automatically */}
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={onTurnstileSuccess}
              onExpire={onTurnstileExpire}
              onError={(err) => { 
                console.error("Turnstile error:", err);
                toast.error(`CAPTCHA error: ${err ? String(err) : "Check console"}`);
                captchaToken.current = null; 
                setCaptchaReady(false); 
              }}
              options={{ size: "invisible", refreshExpired: "auto" }}
            />
            <button
              onClick={save}
              disabled={!validation.valid || saving || !captchaReady}
              title={!captchaReady ? "Verifying you're human…" : "Save endpoint (Ctrl+Enter)"}
              className="btn-primary inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !captchaReady ? (
                <ShieldCheck className="h-4 w-4 animate-pulse" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {!captchaReady && !saving ? "Verifying…" : "Save"}
            </button>
          </div>
        </div>

        {/* URL bar */}
        <div className="mb-6 flex items-center gap-2 rounded-lg card-border bg-gradient-to-br from-surface to-elevated p-3">
          <select
            value={draft.method}
            onChange={(e) => update("method", e.target.value as typeof draft.method)}
            className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded border border-border bg-background outline-none ${
              draft.method === "GET" ? "text-success" :
              draft.method === "POST" ? "text-accent" :
              draft.method === "DELETE" ? "text-destructive" :
              "text-muted-foreground"
            }`}
          >
            {(["GET","POST","PUT","PATCH","DELETE"] as const).map((m) => <option key={m}>{m}</option>)}
          </select>
          <code className="flex-1 font-mono text-sm text-foreground truncate min-w-0">{url}</code>
          <CopyBtn text={url} />
          <button
            onClick={() => window.open(url, "_blank")}
            className="p-2 rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
            title="Open"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* LEFT — Monaco JSON */}
          <div className="rounded-lg card-border bg-surface p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/15 text-primary-glow px-2.5 py-0.5 text-xs font-semibold">
                  Payload
                </span>
                <h3 className="text-sm font-semibold">JSON response</h3>
              </div>
              <div className="flex items-center gap-1">
                <ToolbarBtn onClick={handleFormat} icon={<Wand2 className="h-3.5 w-3.5" />} label="Format" />
                <ToolbarBtn onClick={handleClear} icon={<Trash2 className="h-3.5 w-3.5" />} label="Clear" />
                <ToolbarBtn onClick={handleLoadExample} icon={<FileCode className="h-3.5 w-3.5" />} label="Example" />
                <FakerMenu onInsert={(json) => update("payload", json)} />
              </div>
            </div>

            <MonacoJsonEditor
              value={draft.payload}
              onChange={(v) => update("payload", v)}
              onCmdEnter={save}
              height={420}
            />

            <ValidationBar v={validation} />
          </div>

          {/* RIGHT — Options */}
          <div className="rounded-lg card-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-semibold">
                Configure
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <input
                    type="number"
                    value={draft.status}
                    onChange={(e) => update("status", parseInt(e.target.value) || 200)}
                    min={100}
                    max={599}
                    className="w-full rounded-md card-border bg-elevated px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
                <Field label="Expiry">
                  <select
                    value={draft.expiry}
                    onChange={(e) => update("expiry", e.target.value)}
                    className="w-full rounded-md card-border bg-elevated px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Never</option>
                    <option>1 hour</option>
                    <option>24 hours</option>
                    <option>7 days</option>
                  </select>
                </Field>
              </div>

              <Field label={<>Delay <span className="text-primary-glow font-mono">{draft.delay}ms</span></>}>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={draft.delay}
                  onChange={(e) => update("delay", parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </Field>

              <div className="flex items-center justify-between rounded-md card-border bg-elevated p-3">
                <div className="pr-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    CORS
                    <span title="Allows requests from any origin">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Allow any origin</p>
                </div>
                <Toggle on={draft.cors} onChange={(v) => update("cors", v)} />
              </div>

              <div className="rounded-md card-border bg-elevated p-3 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded card-border bg-background shrink-0">
                  <QrCode className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">QR code</p>
                  <p className="text-[11px] text-muted-foreground">Test from mobile in seconds.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator + snippets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RequestSimulator endpoint={draft} />
          <SnippetPanel endpoint={draft} />
        </div>
      </div>
    </section>
  );
};

const ToolbarBtn = ({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
  >
    {icon}
    {label}
  </button>
);

const ValidationBar = ({ v }: { v: Validation }) => (
  <div
    key={v.message}
    className={`mt-3 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium animate-fade-in ${
      v.valid
        ? "bg-success/10 text-success border border-success/20"
        : "bg-destructive/10 text-destructive border border-destructive/20"
    }`}
  >
    {v.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {v.message}
  </div>
);

const Field = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!on)}
    role="switch"
    aria-checked={on}
    className={`relative h-6 w-11 rounded-full transition-colors ${
      on ? "bg-gradient-primary" : "bg-background border border-border"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
        on ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied");
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`p-2 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors ${copied ? "animate-pulse-glow" : ""}`}
      title="Copy URL"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};
