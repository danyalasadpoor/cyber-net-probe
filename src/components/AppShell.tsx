import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import {
  Activity, LayoutDashboard, Target, Radar, Terminal, BarChart3,
  History, Settings, Menu, X, LogOut, ChevronDown, Wifi,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/targets", label: "Targets", icon: Target },
  { to: "/scanner", label: "Scanner", icon: Radar },
  { to: "/logs", label: "Live Logs", icon: Terminal },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const on = () => setOnline(true), off = () => setOnline(false);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-sidebar/60 backdrop-blur-xl">
        <SidebarInner active={loc.pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-white/10 flex flex-col">
            <div className="flex justify-end p-2">
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarInner active={loc.pathname} onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-white/5 bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-md hover:bg-white/10" onClick={() => setOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("w-2 h-2 rounded-full", online ? "bg-success" : "bg-destructive")} />
              <Wifi className="w-3.5 h-3.5" />
              {online ? "Connected" : "Offline"}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold">
                {email?.[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="hidden sm:inline max-w-[160px] truncate">{email}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/settings"><Settings className="w-4 h-4 mr-2" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden sticky bottom-0 z-30 border-t border-white/5 bg-background/80 backdrop-blur-xl grid grid-cols-5">
          {NAV.slice(0, 5).map((n) => {
            const Icon = n.icon;
            const active = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={cn("flex flex-col items-center justify-center py-2 text-[10px]",
                active ? "text-accent" : "text-muted-foreground")}>
                <Icon className="w-5 h-5 mb-1" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function SidebarInner({ active, onNav }: { active: string; onNav?: () => void }) {
  return (
    <>
      <div className="h-14 flex items-center gap-2 px-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-ring">
          <Activity className="w-4 h-4 text-accent" />
        </div>
        <div className="font-bold tracking-tight">Net<span className="grad-text">Watch</span></div>
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-accent border border-primary/30">PRO</span>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map((n) => {
          const Icon = n.icon;
          const isActive = active === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                isActive
                  ? "bg-primary/15 text-white border border-primary/30 neon-ring"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {n.label}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t border-white/5">
        <div className="glass p-3 text-xs">
          <div className="font-semibold text-foreground">Enterprise ready</div>
          <div className="text-muted-foreground mt-1">200k+ endpoints, RLS-secured, real-time.</div>
        </div>
      </div>
    </>
  );
}
