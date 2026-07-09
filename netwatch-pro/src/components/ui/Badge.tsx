import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "primary" | "success" | "warning" | "danger" | "muted";

const tones: Record<Tone, string> = {
  primary: "bg-primary/15 text-accent border-primary/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  muted: "bg-white/5 text-slate-300 border-white/10",
};

export default function Badge({
  tone = "muted",
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
