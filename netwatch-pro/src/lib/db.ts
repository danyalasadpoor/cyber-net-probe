import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import type { Target, ScanRecord } from "@/types";

const DB_NAME = "netwatch_pro";
const DB_VERSION = 1;

let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;
let ready: Promise<void> | null = null;

async function setupWeb() {
  const platform = Capacitor.getPlatform();
  if (platform !== "web") return;
  // Dynamic import so native builds don't bundle jeep-sqlite
  const loader = await import("jeep-sqlite/loader");
  loader.defineCustomElements(window);
  const jeepEl = document.createElement("jeep-sqlite");
  document.body.appendChild(jeepEl);
  await customElements.whenDefined("jeep-sqlite");
  await CapacitorSQLite.initWebStore();
}

export async function initDatabase(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    await setupWeb().catch((e) => console.warn("web sqlite setup:", e));
    sqlite = new SQLiteConnection(CapacitorSQLite);

    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
    db = isConn
      ? await sqlite.retrieveConnection(DB_NAME, false)
      : await sqlite.createConnection(DB_NAME, false, "no-encryption", DB_VERSION, false);
    await db.open();

    await db.execute(SCHEMA);
    await seedIfEmpty();
  })();
  return ready;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  favorite INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unknown',
  latency REAL,
  availability REAL NOT NULL DEFAULT 0,
  last_checked INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000)
);
CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status);
CREATE INDEX IF NOT EXISTS idx_targets_category ON targets(category);
CREATE INDEX IF NOT EXISTS idx_targets_favorite ON targets(favorite);
CREATE INDEX IF NOT EXISTS idx_targets_name ON targets(name);
CREATE INDEX IF NOT EXISTS idx_targets_last ON targets(last_checked);

CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  total INTEGER NOT NULL DEFAULT 0,
  online INTEGER NOT NULL DEFAULT 0,
  offline INTEGER NOT NULL DEFAULT 0,
  avg_latency REAL,
  status TEXT NOT NULL DEFAULT 'running'
);
CREATE INDEX IF NOT EXISTS idx_scans_started ON scans(started_at);

CREATE TABLE IF NOT EXISTS scan_samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  latency REAL,
  ts INTEGER NOT NULL,
  FOREIGN KEY(scan_id) REFERENCES scans(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_samples_scan ON scan_samples(scan_id);
CREATE INDEX IF NOT EXISTS idx_samples_target ON scan_samples(target_id);
`;

function getDb(): SQLiteDBConnection {
  if (!db) throw new Error("Database not initialized");
  return db;
}

async function seedIfEmpty() {
  const res = await getDb().query("SELECT COUNT(*) as c FROM targets");
  const count = (res.values?.[0]?.c as number) ?? 0;
  if (count > 0) return;
  const seeds: Array<[string, string, string]> = [
    ["Google", "https://google.com", "search"],
    ["Cloudflare", "https://1.1.1.1", "dns"],
    ["GitHub", "https://github.com", "dev"],
    ["OpenAI", "https://api.openai.com", "ai"],
    ["Vercel", "https://vercel.com", "cloud"],
    ["AWS", "https://aws.amazon.com", "cloud"],
    ["Cloudflare DNS", "https://cloudflare.com", "cdn"],
    ["Wikipedia", "https://wikipedia.org", "reference"],
    ["Stack Overflow", "https://stackoverflow.com", "dev"],
    ["npm registry", "https://registry.npmjs.org", "dev"],
    ["Docker Hub", "https://hub.docker.com", "dev"],
    ["Reddit", "https://reddit.com", "social"],
    ["YouTube", "https://youtube.com", "media"],
    ["Netflix", "https://netflix.com", "media"],
    ["MDN", "https://developer.mozilla.org", "docs"],
  ];
  const stmts = seeds.map(([n, a, c]) => ({
    statement:
      "INSERT INTO targets (name,address,category,tags,notes,favorite) VALUES (?,?,?,?,?,0)",
    values: [n, a, c, c, ""],
  }));
  await getDb().executeSet(stmts);
}

// ---------- Targets ----------

export interface TargetsQuery {
  search?: string;
  category?: string;
  status?: string;
  favoriteOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function listTargets(q: TargetsQuery = {}): Promise<{
  rows: Target[];
  total: number;
}> {
  const where: string[] = [];
  const args: any[] = [];
  if (q.search) {
    where.push("(name LIKE ? OR address LIKE ? OR tags LIKE ?)");
    const s = `%${q.search}%`;
    args.push(s, s, s);
  }
  if (q.category && q.category !== "all") {
    where.push("category = ?");
    args.push(q.category);
  }
  if (q.status && q.status !== "all") {
    where.push("status = ?");
    args.push(q.status);
  }
  if (q.favoriteOnly) where.push("favorite = 1");
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total =
    (
      await getDb().query(`SELECT COUNT(*) as c FROM targets ${w}`, args)
    ).values?.[0]?.c ?? 0;

  const limit = q.limit ?? 50;
  const offset = q.offset ?? 0;
  const rows = await getDb().query(
    `SELECT * FROM targets ${w} ORDER BY favorite DESC, name ASC LIMIT ? OFFSET ?`,
    [...args, limit, offset],
  );
  return { rows: (rows.values as Target[]) ?? [], total: total as number };
}

export async function getTarget(id: number): Promise<Target | null> {
  const r = await getDb().query("SELECT * FROM targets WHERE id = ?", [id]);
  return (r.values?.[0] as Target) ?? null;
}

export async function createTarget(
  t: Pick<Target, "name" | "address" | "category" | "tags" | "notes">,
): Promise<number> {
  const r = await getDb().run(
    "INSERT INTO targets (name,address,category,tags,notes) VALUES (?,?,?,?,?)",
    [t.name, t.address, t.category || "general", t.tags || "", t.notes || ""],
  );
  return r.changes?.lastId ?? 0;
}

export async function updateTarget(id: number, patch: Partial<Target>): Promise<void> {
  const keys = Object.keys(patch);
  if (!keys.length) return;
  const set = keys.map((k) => `${k} = ?`).join(", ");
  const vals = keys.map((k) => (patch as any)[k]);
  await getDb().run(`UPDATE targets SET ${set} WHERE id = ?`, [...vals, id]);
}

export async function deleteTarget(id: number): Promise<void> {
  await getDb().run("DELETE FROM targets WHERE id = ?", [id]);
}

export async function toggleFavorite(id: number): Promise<void> {
  await getDb().run(
    "UPDATE targets SET favorite = CASE favorite WHEN 1 THEN 0 ELSE 1 END WHERE id = ?",
    [id],
  );
}

export async function bulkInsertTargets(
  items: Array<Pick<Target, "name" | "address" | "category" | "tags" | "notes">>,
): Promise<number> {
  if (!items.length) return 0;
  const stmts = items.map((t) => ({
    statement:
      "INSERT INTO targets (name,address,category,tags,notes) VALUES (?,?,?,?,?)",
    values: [t.name, t.address, t.category || "general", t.tags || "", t.notes || ""],
  }));
  const r = await getDb().executeSet(stmts);
  return r.changes?.changes ?? items.length;
}

export async function categories(): Promise<string[]> {
  const r = await getDb().query(
    "SELECT DISTINCT category FROM targets ORDER BY category",
  );
  return (r.values ?? []).map((v: any) => v.category);
}

export async function updateStatusMany(
  updates: Array<{ id: number; status: string; latency: number | null; ts: number }>,
): Promise<void> {
  if (!updates.length) return;
  const stmts = updates.map((u) => ({
    statement:
      "UPDATE targets SET status=?, latency=?, last_checked=?, availability = CASE WHEN availability=0 THEN (CASE WHEN ?='online' THEN 100 ELSE 0 END) ELSE (availability*0.9 + (CASE WHEN ?='online' THEN 100 ELSE 0 END)*0.1) END WHERE id=?",
    values: [u.status, u.latency, u.ts, u.status, u.status, u.id],
  }));
  await getDb().executeSet(stmts);
}

// ---------- Scans ----------

export async function createScan(total: number): Promise<number> {
  const r = await getDb().run(
    "INSERT INTO scans (started_at,total,status) VALUES (?,?, 'running')",
    [Date.now(), total],
  );
  return r.changes?.lastId ?? 0;
}

export async function finishScan(
  id: number,
  online: number,
  offline: number,
  avgLatency: number | null,
  cancelled = false,
): Promise<void> {
  await getDb().run(
    "UPDATE scans SET finished_at=?, online=?, offline=?, avg_latency=?, status=? WHERE id=?",
    [Date.now(), online, offline, avgLatency, cancelled ? "cancelled" : "completed", id],
  );
}

export async function addScanSample(
  scanId: number,
  targetId: number,
  status: string,
  latency: number | null,
): Promise<void> {
  await getDb().run(
    "INSERT INTO scan_samples (scan_id,target_id,status,latency,ts) VALUES (?,?,?,?,?)",
    [scanId, targetId, status, latency, Date.now()],
  );
}

export async function listScans(limit = 100): Promise<ScanRecord[]> {
  const r = await getDb().query(
    "SELECT * FROM scans ORDER BY started_at DESC LIMIT ?",
    [limit],
  );
  return (r.values as ScanRecord[]) ?? [];
}

export async function deleteScan(id: number): Promise<void> {
  await getDb().run("DELETE FROM scans WHERE id = ?", [id]);
}

export async function dashboardStats() {
  const [total, online, offline, avg, fastest, slowest, last] = await Promise.all([
    getDb().query("SELECT COUNT(*) as c FROM targets"),
    getDb().query("SELECT COUNT(*) as c FROM targets WHERE status='online'"),
    getDb().query("SELECT COUNT(*) as c FROM targets WHERE status='offline'"),
    getDb().query(
      "SELECT AVG(latency) as v FROM targets WHERE status='online' AND latency IS NOT NULL",
    ),
    getDb().query(
      "SELECT name, latency FROM targets WHERE status='online' AND latency IS NOT NULL ORDER BY latency ASC LIMIT 1",
    ),
    getDb().query(
      "SELECT name, latency FROM targets WHERE status='online' AND latency IS NOT NULL ORDER BY latency DESC LIMIT 1",
    ),
    getDb().query("SELECT MAX(finished_at) as v FROM scans"),
  ]);
  return {
    total: (total.values?.[0]?.c as number) ?? 0,
    online: (online.values?.[0]?.c as number) ?? 0,
    offline: (offline.values?.[0]?.c as number) ?? 0,
    avgLatency: (avg.values?.[0]?.v as number) ?? null,
    fastest: fastest.values?.[0] ?? null,
    slowest: slowest.values?.[0] ?? null,
    lastScan: (last.values?.[0]?.v as number) ?? null,
  };
}

export async function scanTrend(days = 14) {
  const since = Date.now() - days * 86400_000;
  const r = await getDb().query(
    "SELECT started_at, online, offline, avg_latency FROM scans WHERE started_at >= ? ORDER BY started_at ASC",
    [since],
  );
  return (r.values as any[]) ?? [];
}

export async function categoryDistribution() {
  const r = await getDb().query(
    "SELECT category, COUNT(*) as c FROM targets GROUP BY category ORDER BY c DESC",
  );
  return (r.values as Array<{ category: string; c: number }>) ?? [];
}

export async function exportAll(): Promise<{ targets: Target[]; scans: ScanRecord[] }> {
  const [t, s] = await Promise.all([
    getDb().query("SELECT * FROM targets"),
    getDb().query("SELECT * FROM scans"),
  ]);
  return {
    targets: (t.values as Target[]) ?? [],
    scans: (s.values as ScanRecord[]) ?? [],
  };
}

export async function wipeAll(): Promise<void> {
  await getDb().execute(
    "DELETE FROM scan_samples; DELETE FROM scans; DELETE FROM targets;",
  );
}
