import Editor, { type OnMount, loader } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

// MockDrop dark theme — matches design system
loader.init().then((monaco) => {
  monaco.editor.defineTheme("mockdrop-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string.key.json", foreground: "a855f7" },
      { token: "string.value.json", foreground: "10b981" },
      { token: "number", foreground: "06b6d4" },
      { token: "keyword.json", foreground: "f59e0b" },
      { token: "delimiter", foreground: "94a3b8" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#f1f5f9",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#a855f7",
      "editor.selectionBackground": "#7c3aed40",
      "editor.lineHighlightBackground": "#161b27",
      "editorCursor.foreground": "#a855f7",
      "editorIndentGuide.background": "#1e2537",
      "editorIndentGuide.activeBackground": "#7c3aed",
      "editorBracketMatch.background": "#7c3aed30",
      "editorBracketMatch.border": "#a855f7",
      "scrollbarSlider.background": "#1e253780",
      "scrollbarSlider.hoverBackground": "#7c3aed60",
    },
  });
});

type Props = {
  value: string;
  onChange: (v: string) => void;
  onValidate?: (markers: { message: string; line: number }[]) => void;
  onCmdEnter?: () => void;
  height?: string | number;
};

export const MonacoJsonEditor = ({ value, onChange, onValidate, onCmdEnter, height = 380 }: Props) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onCmdEnter?.();
    });
  };

  // Forward markers
  useEffect(() => {
    let unsub: (() => void) | undefined;
    loader.init().then((monaco) => {
      const sub = monaco.editor.onDidChangeMarkers(() => {
        const editor = editorRef.current;
        if (!editor || !onValidate) return;
        const model = editor.getModel();
        if (!model) return;
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        onValidate(
          markers
            .filter((m) => m.severity >= 4)
            .map((m) => ({ message: m.message, line: m.startLineNumber }))
        );
      });
      unsub = () => sub.dispose();
    });
    return () => { unsub?.(); };
  }, [onValidate]);

  return (
    <div className="rounded-md card-border overflow-hidden bg-[#0d1117]">
      <Editor
        height={height}
        defaultLanguage="json"
        theme="mockdrop-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "all",
          padding: { top: 12, bottom: 12 },
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: { enabled: true },
          wordWrap: "on",
        }}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading editor…
          </div>
        }
      />
    </div>
  );
};
