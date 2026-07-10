import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — NetWatch Pro" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const byCategory = useQuery({
    queryKey: ["an-cat"],
    queryFn: async () => {
      const { data } = await supabase.from("targets").select("category,status,latency_ms");
      const map = new Map<string, { category: string; total: number; online: number; latency: number; count: number }>();
      for (const r of data ?? []) {
        const cur = map.get(r.category) ?? { category: r.category, total: 0, online: 0, latency: 0, count: 0 };
        cur.total++; if (r.status === "online") cur.online++;
        if (r.latency_ms != null) { cur.latency += r.latency_ms; cur.count++; }
        map.set(r.category, cur);
      }
      return [...map.values()].map((c) => ({
        category: c.category, total: c.total, online: c.online, offline: c.total - c.online,
        avg_latency: c.count ? Math.round(c.latency / c.count) : 0,
      }));
    },
    refetchInterval: 10000,
  });

  const jobs = useQuery({
    queryKey: ["an-jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("scan_jobs").select("started_at,avg_latency_ms,online,offline")
        .order("started_at", { ascending: false }).limit(20);
      return (data ?? []).reverse().map((j) => ({
        t: new Date(j.started_at).toLocaleTimeString(),
        latency: j.avg_latency_ms ?? 0,
        online: j.online, offline: j.offline,
      }));
    },
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep insight into your fleet's health.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-5">
          <h2 className="font-semibold mb-4">Fleet composition by category</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byCategory.data ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="online" stackId="a" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="offline" stackId="a" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass p-5">
          <h2 className="font-semibold mb-4">Avg latency per scan</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={jobs.data ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="latency" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
