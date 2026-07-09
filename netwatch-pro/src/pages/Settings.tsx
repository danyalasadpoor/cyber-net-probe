import { useState } from "react";
import { Download, Upload, Trash2, Database as DbIcon } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSettings } from "@/store/settings";
import { exportAll, wipeAll, bulkInsertTargets } from "@/lib/db";
import { saveFile } from "@/lib/export";
import { log } from "@/lib/logger";
import { normalizeAddress } from "@/lib/utils";

export default function Settings() {
  const s = useSettings();
  const [busy, setBusy] = useState(false);

  const backup = async () => {
    setBusy(true);
    try {
      const data = await exportAll();
      await saveFile(
        `netwatch-backup-${Date.now()}.json`,
        JSON.stringify(data, null, 2),
        "application/json",
      );
      log.success("Backup created");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setBusy(true);
      try {
        const parsed = JSON.parse(await f.text());
        const targets = parsed.targets ?? [];
        const clean = targets
          .filter((x: any) => x?.name && x?.address)
          .map((x: any) => ({
            name: String(x.name),
            address: normalizeAddress(String(x.address)),
            category: String(x.category ?? "restored"),
            tags: String(x.tags ?? ""),
            notes: String(x.notes ?? ""),
          }));
        const n = await bulkInsertTargets(clean);
        log.success(`Restored ${n} targets`);
      } catch (e: any) {
        log.error(`Restore failed: ${e.message}`);
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const wipe = async () => {
    if (!confirm("Delete ALL targets and scans? This cannot be undone.")) return;
    setBusy(true);
    try {
      await wipeAll();
      log.warn("Database wiped");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">
          <span className="grad-text">Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure scanning behavior and manage local data.
        </p>
      </div>

      <GlassCard title="Scanner">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Request timeout (ms)">
            <Input
              type="number"
              min={500}
              max={60000}
              value={s.timeout}
              onChange={(e) => s.set({ timeout: Math.max(500, Number(e.target.value)) })}
            />
          </Field>
          <Field label="Concurrency">
            <Input
              type="number"
              min={1}
              max={64}
              value={s.concurrency}
              onChange={(e) =>
                s.set({
                  concurrency: Math.max(1, Math.min(64, Number(e.target.value))),
                })
              }
            />
          </Field>
        </div>
      </GlassCard>

      <GlassCard title="Notifications">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={s.notifications}
            onChange={(e) => s.set({ notifications: e.target.checked })}
          />
          Show system notifications when a scan completes
        </label>
      </GlassCard>

      <GlassCard
        title={
          <span className="flex items-center gap-2">
            <DbIcon className="w-4 h-4 text-accent" /> Database
          </span>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={backup} disabled={busy}>
            <Download className="w-4 h-4" /> Backup all data
          </Button>
          <Button variant="ghost" onClick={restore} disabled={busy}>
            <Upload className="w-4 h-4" /> Restore from backup
          </Button>
          <Button variant="danger" onClick={wipe} disabled={busy}>
            <Trash2 className="w-4 h-4" /> Wipe database
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Data lives on-device in a local SQLite store. Nothing is uploaded.
        </p>
      </GlassCard>

      <GlassCard title="Theme">
        <p className="text-sm text-slate-400">
          NetWatch Pro ships with a single premium dark theme tuned for OLED displays.
        </p>
      </GlassCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
