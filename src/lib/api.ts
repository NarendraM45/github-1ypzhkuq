import type { Endpoint } from "@/lib/mockdrop/store";

export const API_URL = "https://mockdrop.duckdns.org";

export const BACKEND_HASH_RE = /^[a-f0-9]{10}$/i;
export const isBackendHash = (id: string) => BACKEND_HASH_RE.test(id);

type BackendExpiry = "never" | "1h" | "24h" | "7d";

const mapExpiryToBackend = (expiry: string): BackendExpiry => {
  const s = (expiry ?? "").trim().toLowerCase();
  if (!s) return "never";
  if (s.includes("never")) return "never";
  if (s.includes("1h") || s.includes("1 hour") || s === "1hour") return "1h";
  if (s.includes("24h") || s.includes("24 hour") || s.includes("24 hours") || s === "24hours") return "24h";
  if (s.includes("7d") || s.includes("7 day") || s.includes("7 days") || s === "7days") return "7d";
  return "never";
};

export type CreateBackendResponse = {
  success: boolean;
  hash?: string;
  url?: string;
  expires_at?: string | null;
  created_at?: string;
  error?: string;
};

export const createEndpointOnBackend = async (
  e: Endpoint,
  captchaToken?: string
): Promise<CreateBackendResponse & { hash: string }> => {
  const res = await fetch(`${API_URL}/api/create.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload: e.payload,
      label: e.label,
      status_code: e.status,
      delay_ms: e.delay,
      cors_enabled: e.cors,
      expiry: mapExpiryToBackend(e.expiry),
      ...(captchaToken ? { captcha_token: captchaToken } : {}),
    }),
  });

  const data: CreateBackendResponse = await res.json().catch(() => ({ success: false, error: "Invalid JSON" }));

  if (!res.ok || !data.success || !data.hash) {
    const msg = data.error || `Backend create failed (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return { ...data, hash: data.hash };
};

