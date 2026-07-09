import { useMemo, useState } from "react";
import { Search, Trash2, Download } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLogs } from "@/lib/logger";
import { saveFile } from "@/lib/export";

const levels = ["all", "info", "success", "warn", "error"] as const;

export default function Logs() {
  const entries = useLogs((s) => s.entries);
  const clear = useLogs((s) => s.clear);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("all");
  const [autoScroll, setAutoScroll] = useState(true);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (level !== "all" && e.level !== level) return false;
      if (q && !e.message.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [entries, q, level]);

  const exportLogs = () => {
    const lines = filtered.map(
      (e) => `[${new Date(e.ts).toISOString()}] ${e.level.toUpperCase()} ${e.message}`,
    );
    saveFile(`netwatch-logs-${Date.now()}.log`, lines.join("\n"), "text/plain");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Live <span className="grad-text">logs</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} entries · in-memory ring buffer
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        </div>
      </div>

      <GlassCard padded>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Filter logs"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            className="h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400 pt-3">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll to newest
        </label>
      </GlassCard>

      <GlassCard padded={false}>
        <div
          className={`font-mono text-xs max-h-[65vh] overflow-y-auto ${autoScroll ? "" : ""}`}
        >
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500">No logs yet.</div>
          )}
          {filtered.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[110px_60px_1fr] gap-3 px-4 py-1.5 border-b border-white/[0.03] hover:bg-white/[0.02]"
            >
              <span className="text-slate-500">
                {new Date(e.ts).toLocaleTimeString()}
              </span>
              <span
                className={
                  e.level === "success"
                    ? "text-success"
                    : e.level === "error"
                      ? "text-danger"
                      : e.level === "warn"
                        ? "text-warning"
                        : "text-accent"
                }
              >
                {e.level.toUpperCase()}
              </span>
              <span className="text-slate-200 break-words">{e.message}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
