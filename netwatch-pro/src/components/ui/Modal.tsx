import type { ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-strong relative w-full max-w-lg neon-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="text-sm font-semibold">{title}</div>
          <button className="text-slate-400 hover:text-white" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-white/5 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
