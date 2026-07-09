export type TargetStatus = "online" | "offline" | "unknown";

export interface Target {
  id: number;
  name: string;
  address: string;
  category: string;
  tags: string;
  notes: string;
  favorite: 0 | 1;
  status: TargetStatus;
  latency: number | null;
  availability: number;
  last_checked: number | null;
  created_at: number;
}

export interface ScanRecord {
  id: number;
  started_at: number;
  finished_at: number | null;
  total: number;
  online: number;
  offline: number;
  avg_latency: number | null;
  status: "running" | "completed" | "cancelled";
}

export interface LogEntry {
  id: string;
  ts: number;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface Settings {
  timeout: number;
  concurrency: number;
  notifications: boolean;
  theme: "dark";
}
