import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Star,
  StarOff,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Download,
  Filter,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  listTargets,
  categories as loadCategories,
  createTarget,
  updateTarget,
  deleteTarget,
  toggleFavorite,
  bulkInsertTargets,
  exportAll,
} from "@/lib/db";
import type { Target } from "@/types";
import { formatMs, formatRelative, normalizeAddress } from "@/lib/utils";
import { saveFile, toCSV } from "@/lib/export";
import { log } from "@/lib/logger";

const PAGE_SIZE = 25;

export default function Targets() {
  const [rows, setRows] = useState<Target[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [editing, setEditing] = useState<Partial<Target> | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    loadCategories().then(setCats);
  }, [tick]);

  useEffect(() => {
    listTargets({
      search,
      category,
      status,
      favoriteOnly: favOnly,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }).then((r) => {
      setRows(r.rows);
      setTotal(r.total);
    });
  }, [search, category, status, favOnly, page, tick]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openNew = () =>
    setEditing({ name: "", address: "", category: "general", tags: "", notes: "" });

  const save = async () => {
    if (!editing) return;
    const name = (editing.name || "").trim();
    const address = normalizeAddress(editing.address || "");
    if (!name || !address) {
      log.error("Name and address are required");
      return;
    }
    if (editing.id) {
      await updateTarget(editing.id, {
        name,
        address,
        category: editing.category,
        tags: editing.tags,
        notes: editing.notes,
      });
      log.success(`Updated ${name}`);
    } else {
      await createTarget({
        name,
        address,
        category: editing.category || "general",
        tags: editing.tags || "",
        notes: editing.notes || "",
      });
      log.success(`Added ${name}`);
    }
    setEditing(null);
    setTick((t) => t + 1);
  };

  const remove = async (id: number) => {
    await deleteTarget(id);
    log.warn(`Deleted target #${id}`);
    setTick((t) => t + 1);
  };

  const fav = async (id: number) => {
    await toggleFavorite(id);
    setTick((t) => t + 1);
  };

  const importJSON = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json,.csv,text/csv";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const text = await f.text();
      try {
        let items: any[] = [];
        if (f.name.endsWith(".csv")) {
          const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
          const keys = header.split(",").map((k) => k.trim());
          items = lines.map((l) => {
            const vals = l.split(",");
            const obj: any = {};
            keys.forEach((k, i) => (obj[k] = vals[i]?.trim() ?? ""));
            return obj;
          });
        } else {
          const parsed = JSON.parse(text);
          items = Array.isArray(parsed) ? parsed : (parsed.targets ?? []);
        }
        const clean = items
          .filter((x) => x && x.name && x.address)
          .map((x) => ({
            name: String(x.name),
            address: normalizeAddress(String(x.address)),
            category: String(x.category ?? "imported"),
            tags: String(x.tags ?? ""),
            notes: String(x.notes ?? ""),
          }));
        const n = await bulkInsertTargets(clean);
        log.success(`Imported ${n} targets`);
        setTick((t) => t + 1);
      } catch (e: any) {
        log.error(`Import failed: ${e.message}`);
      }
    };
    input.click();
  };

  const exportJSON = async () => {
    const data = await exportAll();
    await saveFile(
      `netwatch-targets-${Date.now()}.json`,
      JSON.stringify(data, null, 2),
      "application/json",
    );
    log.success("Exported JSON");
  };

  const exportCSV = async () => {
    const data = await exportAll();
    await saveFile(
      `netwatch-targets-${Date.now()}.csv`,
      toCSV(data.targets),
      "text/csv",
    );
    log.success("Exported CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Target <span className="grad-text">Database</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {total.toLocaleString()} targets · indexed for high-volume queries
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={importJSON}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button variant="ghost" size="sm" onClick={exportJSON}>
            <Download className="w-4 h-4" /> JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="w-4 h-4" /> New target
          </Button>
        </div>
      </div>

      <GlassCard padded>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search name, address, tags"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>
          <select
            className="h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-sm"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">Any status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pt-3">
          <button
            className={`text-xs px-3 py-1.5 rounded-full border ${favOnly ? "bg-primary/20 border-primary/50 text-accent" : "border-white/10 text-slate-400"}`}
            onClick={() => {
              setFavOnly((v) => !v);
              setPage(0);
            }}
          >
            <Filter className="w-3 h-3 inline mr-1" /> Favorites only
          </button>
        </div>
      </GlassCard>

      <GlassCard padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Last</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => fav(t.id)} className="text-warning">
                        {t.favorite ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <div className="text-slate-100">{t.name}</div>
                        <div className="text-[11px] text-slate-500">{t.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 truncate max-w-[220px]">
                    {t.address}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        t.status === "online"
                          ? "success"
                          : t.status === "offline"
                            ? "danger"
                            : "muted"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatMs(t.latency)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {t.availability ? `${Math.round(t.availability)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatRelative(t.last_checked)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(t)}
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(t.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No targets match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-slate-400">
          <span>
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page + 1 >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit target" : "New target"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Field label="Name">
              <Input
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Address (URL)">
              <Input
                value={editing.address || ""}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                placeholder="https://example.com"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Input
                  value={editing.category || ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </Field>
              <Field label="Tags">
                <Input
                  value={editing.tags || ""}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                  placeholder="prod,critical"
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={editing.notes || ""}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm focus:outline-none focus:border-primary/60"
              />
            </Field>
          </div>
        )}
      </Modal>
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
