// Share endpoints via URL hash (base64 encoded JSON) — fully client-side.
import type { Endpoint } from "./store";

const utf8ToBase64 = (s: string) =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const base64ToUtf8 = (s: string) => {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad)));
};

export const buildShareUrl = (e: Endpoint): string => {
  const slim = {
    l: e.label,
    p: e.payload,
    s: e.status,
    d: e.delay,
    c: e.cors,
    m: e.method,
    e: e.expiry,
  };
  const hash = utf8ToBase64(JSON.stringify(slim));
  return `${window.location.origin}${window.location.pathname}#share=${hash}`;
};

export const parseShareHash = (): Partial<Endpoint> | null => {
  const m = window.location.hash.match(/share=([^&]+)/);
  if (!m) return null;
  try {
    const slim = JSON.parse(base64ToUtf8(m[1]));
    return {
      label: slim.l,
      payload: slim.p,
      status: slim.s,
      delay: slim.d,
      cors: slim.c,
      method: slim.m,
      expiry: slim.e,
    };
  } catch {
    return null;
  }
};
