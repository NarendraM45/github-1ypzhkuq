import { useMemo, useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import type { Endpoint } from "@/lib/mockdrop/store";
import { SNIPPET_LANGS, buildSnippet, type SnippetLang } from "@/lib/mockdrop/snippets";
import { toast } from "sonner";

export const SnippetPanel = ({ endpoint }: { endpoint: Endpoint }) => {
  const [lang, setLang] = useState<SnippetLang>("curl");
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => buildSnippet(endpoint, lang), [endpoint, lang]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Snippet copied");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-lg card-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary-glow" />
          <h3 className="text-sm font-semibold">Code snippet</h3>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md card-border bg-elevated px-2.5 py-1 text-xs hover:bg-elevated/70"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-5 pt-3 flex gap-1 border-b border-border">
        {SNIPPET_LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
              lang === l.id
                ? "bg-[#0d1117] text-primary-glow border-b-2 border-primary-glow -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>
      <pre className="bg-[#0d1117] p-4 text-xs font-mono overflow-x-auto max-h-56 overflow-y-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
};
