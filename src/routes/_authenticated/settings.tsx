import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — NetWatch Pro" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [concurrency, setConcurrency] = useState(20);
  const [timeout, setTimeout] = useState(5000);
  const [notif, setNotif] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle();
      setName(p?.full_name ?? "");
      const { data: s } = await supabase.from("user_settings").select("*").eq("user_id", u.user.id).maybeSingle();
      if (s) { setConcurrency(s.concurrency); setTimeout(s.timeout_ms); setNotif(s.notifications); }
    })();
  }, []);

  async function save() {
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("profiles").update({ full_name: name }).eq("id", u.user.id);
      await supabase.from("user_settings").upsert({
        user_id: u.user.id, concurrency, timeout_ms: timeout, notifications: notif,
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your workspace preferences.</p>
      </div>

      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="space-y-2"><Label>Email</Label><Input value={email} disabled /></div>
        <div className="space-y-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      </div>

      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold">Scanner defaults</h2>
        <div className="space-y-2"><Label>Concurrency ({concurrency})</Label>
          <Input type="range" min={1} max={100} value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} />
        </div>
        <div className="space-y-2"><Label>Timeout (ms)</Label>
          <Input type="number" min={500} max={30000} step={500} value={timeout} onChange={(e) => setTimeout(Number(e.target.value))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Notifications</Label>
            <p className="text-xs text-muted-foreground">Alerts when targets go offline.</p>
          </div>
          <Switch checked={notif} onCheckedChange={setNotif} />
        </div>
      </div>

      <Button onClick={save} disabled={busy} className="neon-ring">{busy ? "Saving…" : "Save settings"}</Button>
    </div>
  );
}
