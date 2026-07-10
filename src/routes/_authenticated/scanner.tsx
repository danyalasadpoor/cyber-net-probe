import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useServerFn } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { probeAdHoc, probeBatch, createScanJob } from "@/lib/probe.functions";
import { useServerFn as useSFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Play, Square, Zap, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/scanner")({
  head: () => ({ meta: [{ title: "Scanner — NetWatch Pro" }] }),
  component: ScannerPage,
});

function ScannerPage() {
  const qc = useQueryClient();
  const probe = useSFn(probeAdHoc);
  const runBatch = useSFn(probeBatch);
  const startJob = useSFn(createScanJob);

  // Quick probe
  const [addr, setAddr] = useState("");
  const [quickBusy, setQuickBusy] = useState(false);
  const [quickResult, setQuickResult] = useState<null | Awaited<ReturnType<typeof probe>>>(null);

  async function quickProbe(e: React.FormEvent) {
    e.preventDefault(); setQuickBusy(true); setQuickResult(null);
    try {
      const r = await probe({ data: { address: addr, timeout_ms: 5000 } });
      setQuickResult(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Probe failed");
    } finally { setQuickBusy(false); }
  }

  // Fleet scan
  const targets = useQuery({
    queryKey: ["scan-targets"],
    queryFn: async () => {
      const { data } = await supabase.from("targets").select("id,address,name").limit(500);
      return data ?? [];
    },
  });

  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, online: 0, offline: 0 });

  async function runScan() {
    const ts = targets.data ?? [];
    if (!ts.length) { toast.error("Add some targets first"); return; }
    setRunning(true); stopRef.current = false;
    setProgress({ done: 0, total: ts.length, online: 0, offline: 0 });
    try {
      const job = await startJob({ data: { target_ids: ts.map((t) => t.id) } });
      const CHUNK = 20;
      for (let i = 0; i < ts.length; i += CHUNK) {
        if (stopRef.current) break;
        const batch = ts.slice(i, i + CHUNK).map((t) => ({ id: t.id, address: t.address }));
        const { results } = await runBatch({ data: { job_id: job.id, targets: batch, timeout_ms: 5000 } });
        const on = results.filter((r) => r.status === "online").length;
        setProgress((p) => ({
          ...p, done: p.done + results.length,
          online: p.online + on, offline: p.offline + (results.length - on),
        }));
      }
      toast.success("Scan complete");
      qc.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally { setRunning(false); }
  }

  const pct = progress.total ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scanner</h1>
        <p className="text-muted-foreground">Probe endpoints in real time via our server-side engine.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Quick probe</h2>
          </div>
          <form onSubmit={quickProbe} className="flex gap-2">
            <Input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="https://example.com" required />
            <Button disabled={quickBusy}>{quickBusy ? "Probing…" : "Probe"}</Button>
          </form>
          {quickResult && (
            <div className={`rounded-lg border p-4 ${quickResult.status === "online" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-center gap-2 font-medium">
                {quickResult.status === "online" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}
                <span className="capitalize">{quickResult.status}</span>
                {quickResult.status_code && <span className="text-xs text-muted-foreground">HTTP {quickResult.status_code}</span>}
              </div>
              <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
                <div>Latency: <span className="text-foreground">{quickResult.latency_ms ?? "—"} ms</span></div>
                <div>Checked: <span className="text-foreground">{new Date(quickResult.checked_at).toLocaleTimeString()}</span></div>
              </div>
              {quickResult.error && <div className="mt-2 text-xs text-destructive">{quickResult.error}</div>}
            </div>
          )}
        </div>

        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Fleet scan</h2>
            <span className="text-xs text-muted-foreground">{targets.data?.length ?? 0} targets</span>
          </div>
          <p className="text-sm text-muted-foreground">Run all targets through the probing engine and persist results.</p>
          <div className="flex gap-2">
            {!running ? (
              <Button onClick={runScan} className="neon-ring"><Play className="w-4 h-4 mr-2" />Start scan</Button>
            ) : (
              <Button variant="destructive" onClick={() => { stopRef.current = true; }}><Square className="w-4 h-4 mr-2" />Stop</Button>
            )}
          </div>
          {progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.done} / {progress.total}</span>
                <span>{Math.round(pct)}%</span>
              </div>
              <Progress value={pct} />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-md bg-success/10 border border-success/30 p-3 text-center">
                  <div className="text-2xl font-bold text-success">{progress.online}</div>
                  <div className="text-xs text-muted-foreground">Online</div>
                </div>
                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-center">
                  <div className="text-2xl font-bold text-destructive">{progress.offline}</div>
                  <div className="text-xs text-muted-foreground">Offline</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
