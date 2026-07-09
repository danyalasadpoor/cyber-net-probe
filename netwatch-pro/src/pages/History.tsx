import { useEffect, useState } from "react";
import { Trash2, Download } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { listScans, deleteScan } from "@/lib/db";
import type { ScanRecord } from "@/types";
import { formatDate, formatMs } from "@/lib/utils";
import { saveFile, toCSV } from "@/lib/export";
import { log } from "@/lib/logger";

export default function History() {
  const [rows, setRows] = useState<ScanRecord[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    listScans(200).then(setRows);
  }, [tick]);

  const remove = async (id: number) => {
    await deleteScan(id);
    log.warn(`Deleted scan #${id}`);
    setTick((t) => t + 1);
  };

  const exportAll = () => {
    saveFile(`netwatch-history-${Date.now()}.csv`, toCSV(rows), "text/csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Scan <span className="grad-text">history</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">{rows.length} recorded scans</p>
        </div>
        <Button variant="ghost" size="sm" onClick={exportAll}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <GlassCard padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Finished</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Online</th>
                <th className="px-4 py-3">Offline</th>
                <th className="px-4 py-3">Avg latency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-slate-500">#{s.id}</td>
                  <td className="px-4 py-3">{formatDate(s.started_at)}</td>
                  <td className="px-4 py-3">{formatDate(s.finished_at)}</td>
                  <td className="px-4 py-3">{s.total}</td>
                  <td className="px-4 py-3 text-success">{s.online}</td>
                  <td className="px-4 py-3 text-danger">{s.offline}</td>
                  <td className="px-4 py-3">{formatMs(s.avg_latency)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        s.status === "completed"
                          ? "success"
                          : s.status === "cancelled"
                            ? "warning"
                            : "primary"
                      }
                    >
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(s.id)}>
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No scans yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
