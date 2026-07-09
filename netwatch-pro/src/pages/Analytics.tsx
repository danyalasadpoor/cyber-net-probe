import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import GlassCard from "@/components/GlassCard";
import { categoryDistribution, scanTrend } from "@/lib/db";

const COLORS = ["#3B82F6", "#60A5FA", "#22C55E", "#F59E0B", "#EF4444", "#a78bfa", "#22d3ee"];

export default function Analytics() {
  const [trend, setTrend] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [t, c] = await Promise.all([scanTrend(30), categoryDistribution()]);
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
      setCats(c.map((r: any) => ({ name: r.category, value: r.c })));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">
          <span className="grad-text">Analytics</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Long-term trends aggregated from every scan.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard title="Latency trend (30d)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
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
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Online vs Offline">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trend}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
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
                <Bar dataKey="online" stackId="a" fill="#22C55E" />
                <Bar dataKey="offline" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Category distribution" className="lg:col-span-2">
          <div className="h-80">
            {cats.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cats}
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {cats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,25,40,0.95)",
                      border: "1px solid rgba(96,165,250,0.3)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                Add targets to see category breakdown.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
