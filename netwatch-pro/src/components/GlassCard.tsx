import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

export default function GlassCard({
  title,
  action,
  padded = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <div className={cn("glass", className)} {...rest}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="text-sm font-semibold text-slate-200">{title}</div>
          <div>{action}</div>
        </div>
      )}
      <div className={cn(padded ? "p-5" : "")}>{children}</div>
    </div>
  );
}
