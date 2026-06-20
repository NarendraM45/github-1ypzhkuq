import type { Endpoint } from "./store";
import { endpointUrl } from "./store";

export type SnippetLang = "curl" | "fetch" | "axios" | "node";

export const SNIPPET_LANGS: { id: SnippetLang; name: string }[] = [
  { id: "curl", name: "cURL" },
  { id: "fetch", name: "fetch" },
  { id: "axios", name: "axios" },
  { id: "node", name: "Node" },
];

export function buildSnippet(e: Endpoint, lang: SnippetLang): string {
  const url = endpointUrl(e.id);
  const method = e.method;
  const hasBody = method !== "GET" && method !== "DELETE";
  const sampleBody = '{"hello":"world"}';

  switch (lang) {
    case "curl":
      return [
        `curl -X ${method} '${url}' \\`,
        `  -H 'Accept: application/json'${hasBody ? " \\" : ""}`,
        ...(hasBody
          ? [`  -H 'Content-Type: application/json' \\`, `  -d '${sampleBody}'`]
          : []),
      ].join("\n");

    case "fetch":
      return `const res = await fetch("${url}"${
        method !== "GET"
          ? `, {\n  method: "${method}",${hasBody ? `\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${sampleBody})` : ""}\n}`
          : ""
      });\nconst data = await res.json();\nconsole.log(data);`;

    case "axios":
      return `import axios from "axios";\n\nconst { data } = await axios.${method.toLowerCase()}(\n  "${url}"${hasBody ? `,\n  ${sampleBody}` : ""}\n);\nconsole.log(data);`;

    case "node":
      return `import { request } from "node:https";\n\nconst req = request("${url}", { method: "${method}" }, (res) => {\n  let body = "";\n  res.on("data", (c) => (body += c));\n  res.on("end", () => console.log(JSON.parse(body)));\n});\n${hasBody ? `req.write(${JSON.stringify(sampleBody)});\n` : ""}req.end();`;
  }
}
