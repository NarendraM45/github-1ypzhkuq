import { openDB, type IDBPDatabase } from "idb";
import { API_URL } from "@/lib/api";

export type Endpoint = {
  id: string;
  label: string;
  payload: string; // raw JSON string
  status: number;
  expiry: string;
  delay: number;
  cors: boolean;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  createdAt: number;
  updatedAt: number;
};

export type RequestLog = {
  id: string;
  endpointId: string;
  ts: number;
  method: string;
  status: number;
  ip: string;
  responseTime: number;
};

const DB_NAME = "mockdrop";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("endpoints")) {
          const s = db.createObjectStore("endpoints", { keyPath: "id" });
          s.createIndex("updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("logs")) {
          const s = db.createObjectStore("logs", { keyPath: "id" });
          s.createIndex("endpointId", "endpointId");
          s.createIndex("ts", "ts");
        }
      },
    });
  }
  return dbPromise;
};

export const store = {
  async listEndpoints(): Promise<Endpoint[]> {
    const db = await getDB();
    const all = await db.getAll("endpoints");
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  },
  async getEndpoint(id: string): Promise<Endpoint | undefined> {
    const db = await getDB();
    return db.get("endpoints", id);
  },
  async saveEndpoint(e: Endpoint): Promise<void> {
    const db = await getDB();
    await db.put("endpoints", e);
  },
  async deleteEndpoint(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("endpoints", id);
    // also clean logs
    const logs = await db.getAllFromIndex("logs", "endpointId", id);
    const tx = db.transaction("logs", "readwrite");
    await Promise.all(logs.map((l) => tx.store.delete(l.id)));
    await tx.done;
  },
  async listLogs(endpointId?: string, limit = 100): Promise<RequestLog[]> {
    const db = await getDB();
    const all = endpointId
      ? await db.getAllFromIndex("logs", "endpointId", endpointId)
      : await db.getAll("logs");
    return all.sort((a, b) => b.ts - a.ts).slice(0, limit);
  },
  async addLog(l: RequestLog): Promise<void> {
    const db = await getDB();
    await db.put("logs", l);
  },
  async clearLogs(endpointId?: string): Promise<void> {
    const db = await getDB();
    if (endpointId) {
      const logs = await db.getAllFromIndex("logs", "endpointId", endpointId);
      const tx = db.transaction("logs", "readwrite");
      await Promise.all(logs.map((l) => tx.store.delete(l.id)));
      await tx.done;
    } else {
      await db.clear("logs");
    }
  },
  async exportAll(): Promise<{ endpoints: Endpoint[]; logs: RequestLog[]; exportedAt: number }> {
    const db = await getDB();
    return {
      endpoints: await db.getAll("endpoints"),
      logs: await db.getAll("logs"),
      exportedAt: Date.now(),
    };
  },
  async importAll(data: { endpoints?: Endpoint[]; logs?: RequestLog[] }): Promise<{ endpoints: number; logs: number }> {
    const db = await getDB();
    let ec = 0, lc = 0;
    if (data.endpoints?.length) {
      const tx = db.transaction("endpoints", "readwrite");
      for (const e of data.endpoints) {
        await tx.store.put(e);
        ec++;
      }
      await tx.done;
    }
    if (data.logs?.length) {
      const tx = db.transaction("logs", "readwrite");
      for (const l of data.logs) {
        await tx.store.put(l);
        lc++;
      }
      await tx.done;
    }
    return { endpoints: ec, logs: lc };
  },
};

export const newId = () => Math.random().toString(36).slice(2, 10);
export const endpointUrl = (hash: string) => `${API_URL}/api/serve.php?hash=${encodeURIComponent(hash)}`;
