import { useEffect, useState } from "react";
import { Play, Pause, Square, RotateCw, Zap } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { scanner, type ScanProgress } from "@/lib/scanner";
import { listTargets } from "@/lib/db";
import type { Target } from "@/types";
import { formatMs, formatRelative } from "@/lib/utils";

const PRESETS = [10, 100, 1000, 5000];

export default function Scanner() {
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [count, setCount] = useState<number>(100);
  const [results, setResults] = useState<Target[]>([]);

  useEffect(() => {
    const unsub = scanner.subscribe(setProgress);
    return () => {
      unsub();
    };
  }, []);
  useEffect(() => {
    const load = () =>
      listTargets({ limit: 50, offset: 0 }).then((r) => setResults(r.rows));
    load();
    const iv = setInterval(load, 1500);
    return () => clearInterval(iv);
  }, []);

  const pct = progress?.total
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;
  const remaining = progress ? progress.total - progress.completed : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            <span className="grad-text">Scanner</span> engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure the batch size, then start. Only the requested count is scanned.
          </p>
        </div>
      </div>

      <GlassCard title="Scan configuration">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setCount(p)}
                className={`px-4 py-2 rounded-lg text-sm border transition ${
                  count === p
                    ? "bg-primary/20 border-primary/50 text-accent"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
                disabled={progress?.running}
              >
                {p.toLocaleString()}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={200000}
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
              disabled={progress?.running}
              className="w-32 h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => scanner.start(count)}
              disabled={progress?.running}
            >
              <Play className="w-4 h-4" /> Start scan
            </Button>
            {progress?.running && !progress.paused && (
              <Button variant="ghost" onClick={() => scanner.pause()}>
                <Pause className="w-4 h-4" /> Pause
              </Button>
            )}
            {progress?.running && progress.paused && (
              <Button variant="ghost" onClick={() => scanner.resume()}>
                <RotateCw className="w-4 h-4" /> Resume
              </Button>
            )}
            {progress?.running && (
              <Button variant="danger" onClick={() => scanner.stop()}>
                <Square className="w-4 h-4" /> Stop
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-4 gap-4">
        <Metric
          label="Progress"
          value={`${pct}%`}
          hint={`${progress?.completed ?? 0}/${progress?.total ?? 0}`}
        />
        <Metric label="Remaining" value={remaining.toLocaleString()} />
        <Metric
          label="Speed"
          value={`${(progress?.speed ?? 0).toFixed(1)}/s`}
          hint="targets/sec"
        />
        <Metric
          label="ETA"
          value={progress?.eta ? `${Math.max(0, Math.round(progress.eta))}s` : "—"}
        />
      </div>

      <GlassCard title="Live progress">
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>
            {progress?.running ? (
              <span className="inline-flex items-center gap-1 text-accent">
                <Zap className="w-3 h-3 animate-pulse" /> Scanning{" "}
                {progress.currentTarget ?? "…"}
              </span>
            ) : (
              "Idle"
            )}
          </span>
          <span>
            {progress?.online ?? 0} online · {progress?.offline ?? 0} offline
          </span>
        </div>
      </GlassCard>

      <GlassCard title="Recent results" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {results.map((t) => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 truncate max-w-[240px]">
                    {t.address}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        t.status === "online"
                          ? "success"
                          : t.status === "offline"
                            ? "danger"
                            : "muted"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatMs(t.latency)}</td>
                  <td className="px-4 py-3">
                    {t.availability ? `${Math.round(t.availability)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatRelative(t.last_checked)}
                  </td>
                </tr>
              ))}
              {!results.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No results yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="glass p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-2xl font-semibold text-white mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
