import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500",
        "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition",
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = "Input";
export default Input;
