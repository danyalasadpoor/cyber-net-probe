import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Plus, Search, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/targets")({
  head: () => ({ meta: [{ title: "Targets — NetWatch Pro" }] }),
  component: TargetsPage,
});

type Target = {
  id: number;
  name: string;
  address: string;
  category: string;
  tags: string[];
  status: string;
  latency_ms: number | null;
  availability: number;
  favorite: boolean;
  last_checked_at: string | null;
};

function TargetsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "favorites">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const list = useQuery({
    queryKey: ["targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("targets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Target[];
    },
    refetchInterval: 10000,
  });

  const filtered = useMemo(() => {
    let rows = list.data ?? [];
    if (filter === "online") rows = rows.filter((r) => r.status === "online");
    if (filter === "offline") rows = rows.filter((r) => r.status === "offline");
    if (filter === "favorites") rows = rows.filter((r) => r.favorite);
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(s) || r.address.toLowerCase().includes(s));
    }
    return rows;
  }, [list.data, q, filter]);

  const toggleFav = useMutation({
    mutationFn: async (t: Target) => {
      await supabase.from("targets").update({ favorite: !t.favorite }).eq("id", t.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from("targets").delete().eq("id", id);
    },
    onSuccess: () => { toast.success("Target removed"); qc.invalidateQueries({ queryKey: ["targets"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Targets</h1>
          <p className="text-muted-foreground">{list.data?.length ?? 0} endpoints under monitoring.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/5 border-white/10"><Upload className="w-4 h-4 mr-2" />Bulk import</Button>
            </DialogTrigger>
            <BulkImportDialog onDone={() => { setBulkOpen(false); qc.invalidateQueries({ queryKey: ["targets"] }); }} />
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="neon-ring"><Plus className="w-4 h-4 mr-2" />Add target</Button>
            </DialogTrigger>
            <AddTargetDialog onDone={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["targets"] }); }} />
          </Dialog>
        </div>
      </div>

      <div className="glass p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or address" className="pl-9" />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {(["all", "online", "offline", "favorites"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md capitalize transition ${
                filter === f ? "bg-primary text-primary-foreground" : "hover:bg-white/5 text-muted-foreground"
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase bg-white/[0.02]">
              <tr>
                <th className="text-left p-3">★</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Address</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Latency</th>
                <th className="text-right p-3">Uptime</th>
                <th className="text-left p-3">Last check</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <button onClick={() => toggleFav.mutate(t)} className="text-muted-foreground hover:text-warning">
                      <Star className={`w-4 h-4 ${t.favorite ? "fill-warning text-warning" : ""}`} />
                    </button>
                  </td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{t.address}</td>
                  <td className="p-3"><StatusDot status={t.status} /></td>
                  <td className="p-3 text-right">{t.latency_ms != null ? `${t.latency_ms} ms` : "—"}</td>
                  <td className="p-3 text-right">{t.availability?.toFixed(1) ?? "0.0"}%</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {t.last_checked_at ? new Date(t.last_checked_at).toLocaleString() : "never"}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => del.mutate(t.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                  No targets found. Click "Add target" to start monitoring.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "online" ? "bg-success" : status === "offline" ? "bg-destructive" : "bg-muted";
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${color} ${status === "online" ? "shadow-[0_0_8px_rgba(34,197,94,0.7)]" : ""}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
}

function AddTargetDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("website");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("targets").insert({
        user_id: u.user!.id, name, address, category,
      });
      if (error) throw error;
      toast.success("Target added");
      setName(""); setAddress("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setBusy(false); }
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add monitoring target</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label>Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="API Gateway" /></div>
        <div className="space-y-2"><Label>Address (URL or host)</Label><Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="api.example.com" /></div>
        <div className="space-y-2"><Label>Category</Label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full h-9 rounded-md bg-white/5 border border-white/10 px-3 text-sm">
            {["website", "api", "server", "database", "cdn", "other"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <DialogFooter><Button disabled={busy}>{busy ? "Adding…" : "Add target"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function BulkImportDialog({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const rows = lines.map((line) => {
        const [name, address] = line.includes(",") ? line.split(",").map((s) => s.trim()) : [line, line];
        return { user_id: u.user!.id, name: name || address, address, category: "website" };
      });
      if (!rows.length) throw new Error("Nothing to import");
      // Batch insert 500 at a time
      for (let i = 0; i < rows.length; i += 500) {
        const chunk = rows.slice(i, i + 500);
        const { error } = await supabase.from("targets").insert(chunk);
        if (error) throw error;
      }
      toast.success(`Imported ${rows.length} targets`);
      setText("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally { setBusy(false); }
  }
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Bulk import targets</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted-foreground">One per line. Format: <code>name,address</code> or just <code>address</code>.</p>
        <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"Google,google.com\nCloudflare,1.1.1.1\napi.example.com"} className="font-mono text-xs" />
        <DialogFooter><Button disabled={busy}>{busy ? "Importing…" : "Import"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
