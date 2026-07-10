import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Terminal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/logs")({
  head: () => ({ meta: [{ title: "Live Logs — NetWatch Pro" }] }),
  component: LogsPage,
});

function LogsPage() {
  const logs = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
    refetchInterval: 3000,
  });

  const color = (l: string) => l === "error" ? "text-destructive" : l === "warn" ? "text-warning" : l === "success" ? "text-success" : "text-accent";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Logs</h1>
        <p className="text-muted-foreground">Streaming activity from your monitoring workspace.</p>
      </div>
      <div className="glass overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <Terminal className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">activity.log</span>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" /> live · 3s
          </span>
        </div>
        <div className="font-mono text-xs max-h-[70vh] overflow-y-auto scrollbar-thin p-2">
          {(logs.data ?? []).map((l) => (
            <div key={l.id} className="grid grid-cols-[auto_auto_1fr] gap-3 px-2 py-1 hover:bg-white/[0.03] rounded">
              <span className="text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</span>
              <span className={`${color(l.level)} uppercase font-bold w-14`}>{l.level}</span>
              <span className="text-foreground">{l.message}</span>
            </div>
          ))}
          {(logs.data ?? []).length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Log stream is empty. Run a scan to see activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
