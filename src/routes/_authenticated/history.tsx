import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — NetWatch Pro" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const jobs = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const { data } = await supabase.from("scan_jobs").select("*").order("started_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan history</h1>
        <p className="text-muted-foreground">Every scan you've run, forever archived.</p>
      </div>
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase bg-white/[0.02]">
              <tr>
                <th className="p-3 text-left">Started</th>
                <th className="p-3 text-left">Finished</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Online</th>
                <th className="p-3 text-right">Offline</th>
                <th className="p-3 text-right">Avg latency</th>
              </tr>
            </thead>
            <tbody>
              {(jobs.data ?? []).map((j) => (
                <tr key={j.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">{new Date(j.started_at).toLocaleString()}</td>
                  <td className="p-3">{j.finished_at ? new Date(j.finished_at).toLocaleString() : "—"}</td>
                  <td className="p-3 capitalize">{j.status}</td>
                  <td className="p-3 text-right">{j.total}</td>
                  <td className="p-3 text-right text-success">{j.online}</td>
                  <td className="p-3 text-right text-destructive">{j.offline}</td>
                  <td className="p-3 text-right">{j.avg_latency_ms ?? "—"} ms</td>
                </tr>
              ))}
              {(jobs.data ?? []).length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No scan history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
