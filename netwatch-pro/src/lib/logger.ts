import { create } from "zustand";
import type { LogEntry } from "@/types";

interface LogState {
  entries: LogEntry[];
  push: (level: LogEntry["level"], message: string) => void;
  clear: () => void;
}

const MAX = 2000;

export const useLogs = create<LogState>((set) => ({
  entries: [],
  push: (level, message) =>
    set((s) => {
      const next: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ts: Date.now(),
        level,
        message,
      };
      const arr = [next, ...s.entries];
      if (arr.length > MAX) arr.length = MAX;
      return { entries: arr };
    }),
  clear: () => set({ entries: [] }),
}));

export const log = {
  info: (m: string) => useLogs.getState().push("info", m),
  warn: (m: string) => useLogs.getState().push("warn", m),
  error: (m: string) => useLogs.getState().push("error", m),
  success: (m: string) => useLogs.getState().push("success", m),
};
