import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Radar,
  Terminal,
  BarChart3,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/targets", label: "Targets", icon: Database },
  { to: "/scanner", label: "Scanner", icon: Radar },
  { to: "/logs", label: "Live Logs", icon: Terminal },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed md:sticky top-0 z-40 md:z-auto h-screen w-64 shrink-0 transition-transform md:translate-x-0",
          "border-r border-white/5 bg-[rgba(10,14,28,0.9)] backdrop-blur-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold grad-text">NetWatch</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Pro
              </div>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-primary/15 text-white shadow-glow border border-primary/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )
              }
            >
              <it.icon className="w-4 h-4" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 text-[11px] text-slate-500 border-t border-white/5">
          <div>NetWatch Pro v1.0</div>
          <div className="opacity-70">Offline-first · Local SQLite</div>
        </div>
      </aside>
    </>
  );
}
