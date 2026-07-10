import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Server, Wifi, WifiOff, Gauge, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NetWatch Pro" }] }),
  component: DashboardPage,
});

type Stats = {
  total: number;
  online: number;
  offline: number;
  unknown: number;
  avgLatency: number;
  availability: number;
};

async function loadStats(): Promise<Stats> {
  const { data } = await supabase.from("targets").select("status,latency_ms,availability");
  const rows = data ?? [];
  const online = rows.filter((r) => r.status === "online").length;
  const offline = rows.filter((r) => r.status === "offline").length;
  const unknown = rows.length - online - offline;
  const lats = rows.map((r) => r.latency_ms).filter((v): v is number => v != null);
  const avg = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;
  const av = rows.length ? rows.reduce((a, b) => a + (b.availability ?? 0), 0) / rows.length : 0;
  return { total: rows.length, online, offline, unknown, avgLatency: avg, availability: Number(av.toFixed(2)) };
}

async function loadTrend() {
  const { data } = await supabase
    .from("scan_results")
    .select("checked_at,latency_ms,status")
    .order("checked_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []).reverse();
  return rows.map((r, i) => ({
    idx: i,
    latency: r.latency_ms ?? 0,
    online: r.status === "online" ? 1 : 0,
  }));
}

async function loadRecentJobs() {
  const { data } = await supabase
    .from("scan_jobs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

function DashboardPage() {
  const stats = useQuery({ queryKey: ["dash-stats"], queryFn: loadStats, refetchInterval: 5000 });
  const trend = useQuery({ queryKey: ["dash-trend"], queryFn: loadTrend, refetchInterval: 5000 });
  const jobs = useQuery({ queryKey: ["dash-jobs"], queryFn: loadRecentJobs, refetchInterval: 5000 });

  const s = stats.data;
  const pieData = s ? [
    { name: "Online", value: s.online, color: "#22C55E" },
    { name: "Offline", value: s.offline, color: "#EF4444" },
    { name: "Unknown", value: s.unknown, color: "#64748B" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">Real-time overview of your network fleet.</p>
        </div>
        <Link to="/scanner" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 neon-ring">
          <Activity className="w-4 h-4" /> Launch scan
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total targets" value={s?.total ?? 0} icon={Server} tint="from-blue-500/20 to-purple-500/20" />
        <StatCard label="Online" value={s?.online ?? 0} icon={Wifi} tint="from-emerald-500/20 to-green-500/20" accent="text-success" />
        <StatCard label="Offline" value={s?.offline ?? 0} icon={WifiOff} tint="from-rose-500/20 to-red-500/20" accent="text-destructive" />
        <StatCard label="Avg latency" value={`${s?.avgLatency ?? 0} ms`} icon={Gauge} tint="from-cyan-500/20 to-blue-500/20" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Latency trend</h2>
            <span className="text-xs text-muted-foreground">last 200 probes</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend.data ?? []}>
                <defs>
                  <linearGradient id="lat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="idx" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="latency" stroke="#60A5FA" fill="url(#lat)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-5">
          <h2 className="font-semibold mb-4">Fleet status</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass p-5">
        <h2 className="font-semibold mb-3">Recent scan jobs</h2>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-2">Started</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Total</th>
                <th className="text-right py-2 px-2">Online</th>
                <th className="text-right py-2 px-2">Offline</th>
                <th className="text-right py-2 px-2">Avg ms</th>
              </tr>
            </thead>
            <tbody>
              {(jobs.data ?? []).map((j) => (
                <tr key={j.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 px-2">{new Date(j.started_at).toLocaleString()}</td>
                  <td className="py-2 px-2"><StatusPill status={j.status} /></td>
                  <td className="py-2 px-2 text-right">{j.total}</td>
                  <td className="py-2 px-2 text-right text-success">{j.online}</td>
                  <td className="py-2 px-2 text-right text-destructive">{j.offline}</td>
                  <td className="py-2 px-2 text-right">{j.avg_latency_ms ?? "—"}</td>
                </tr>
              ))}
              {(jobs.data ?? []).length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No scans yet — launch your first scan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint, accent }: {
  label: string; value: number | string; icon: React.ComponentType<{ className?: string }>;
  tint: string; accent?: string;
}) {
  return (
    <div className={`glass p-5 relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${tint} opacity-40 pointer-events-none`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className={`text-3xl font-bold mt-1 ${accent ?? ""}`}>{value}</div>
        </div>
        <Icon className={`w-5 h-5 ${accent ?? "text-accent"}`} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: "bg-primary/20 text-accent border-primary/30",
    completed: "bg-success/20 text-success border-success/30",
    failed: "bg-destructive/20 text-destructive border-destructive/30",
    paused: "bg-warning/20 text-warning border-warning/30",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status] ?? "bg-white/10 border-white/10"}`}>{status}</span>;
}
