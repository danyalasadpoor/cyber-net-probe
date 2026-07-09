import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger";
  hint?: string;
}

const accentMap = {
  primary: "from-primary/30 to-accent/20 text-accent",
  success: "from-success/30 to-success/10 text-success",
  warning: "from-warning/30 to-warning/10 text-warning",
  danger: "from-danger/30 to-danger/10 text-danger",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  hint,
}: Props) {
  return (
    <div className="glass p-5 relative overflow-hidden group hover:border-primary/40 transition-colors">
      <div
        className={cn(
          "absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-60 bg-gradient-to-br",
          accentMap[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
          <div className="text-2xl font-semibold mt-2 text-white">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br border border-white/10",
            accentMap[accent],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
