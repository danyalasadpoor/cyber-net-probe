import { useEffect, useState } from "react";
import {
  Database,
  CheckCircle2,
  XCircle,
  Gauge,
  Zap,
  Turtle,
  Clock,
  Activity,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import GlassCard from "@/components/GlassCard";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { dashboardStats, scanTrend } from "@/lib/db";
import { formatMs, formatRelative } from "@/lib/utils";
import { useLogs } from "@/lib/logger";

interface Stats {
  total: number;
  online: number;
  offline: number;
  avgLatency: number | null;
  fastest: { name: string; latency: number } | null;
  slowest: { name: string; latency: number } | null;
  lastScan: number | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const entries = useLogs((s) => s.entries).slice(0, 8);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [s, t] = await Promise.all([dashboardStats(), scanTrend(14)]);
      if (!alive) return;
      setStats(s as Stats);
      setTrend(
        (t as any[]).map((r) => ({
          ts: new Date(r.started_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          online: r.online,
          offline: r.offline,
          latency: r.avg_latency ? Math.round(r.avg_latency) : 0,
        })),
      );
    };
    load();
    const iv = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">
          Network <span className="grad-text">Overview</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time posture of every monitored target.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total targets" value={stats?.total ?? "—"} icon={Database} />
        <StatCard
          label="Online"
          value={stats?.online ?? "—"}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Offline"
          value={stats?.offline ?? "—"}
          icon={XCircle}
          accent="danger"
        />
        <StatCard
          label="Avg latency"
          value={formatMs(stats?.avgLatency)}
          icon={Gauge}
          accent="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard
          title="Scan trend (14d)"
          className="lg:col-span-2"
          action={<span className="text-xs text-slate-500">online / offline</span>}
        >
          <div className="h-64">
            {trend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trend}
                  margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="gOn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="ts"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,25,40,0.95)",
                      border: "1px solid rgba(96,165,250,0.3)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="online"
                    stroke="#22C55E"
                    fill="url(#gOn)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="offline"
                    stroke="#EF4444"
                    fill="url(#gOff)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </GlassCard>

        <GlassCard title="Vital signs">
          <div className="space-y-4">
            <VitalRow
              icon={Zap}
              tone="text-success"
              label="Fastest"
              main={stats?.fastest?.name ?? "—"}
              sub={formatMs(stats?.fastest?.latency ?? null)}
            />
            <VitalRow
              icon={Turtle}
              tone="text-warning"
              label="Slowest"
              main={stats?.slowest?.name ?? "—"}
              sub={formatMs(stats?.slowest?.latency ?? null)}
            />
            <VitalRow
              icon={Clock}
              tone="text-accent"
              label="Last scan"
              main={formatRelative(stats?.lastScan ?? null)}
              sub={stats?.lastScan ? new Date(stats.lastScan).toLocaleString() : ""}
            />
          </div>
        </GlassCard>
      </div>

      <GlassCard
        title={
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Recent activity
          </span>
        }
      >
        {entries.length ? (
          <ul className="divide-y divide-white/5">
            {entries.map((e) => (
              <li key={e.id} className="py-2 flex items-center gap-3 text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    e.level === "success"
                      ? "bg-success"
                      : e.level === "error"
                        ? "bg-danger"
                        : e.level === "warn"
                          ? "bg-warning"
                          : "bg-accent"
                  }`}
                />
                <span className="text-slate-300 flex-1 truncate">{e.message}</span>
                <span className="text-xs text-slate-500 shrink-0">
                  {formatRelative(e.ts)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-500 text-center py-6">
            No activity yet. Start a scan to see it here.
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function VitalRow({
  icon: Icon,
  tone,
  label,
  main,
  sub,
}: {
  icon: any;
  tone: string;
  label: string;
  main: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm text-white truncate">{main}</div>
      </div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-slate-500">
      Run a few scans to populate this chart.
    </div>
  );
}
