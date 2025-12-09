import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, ...props }, ref) => (
    <label className="flex flex-col gap-1">
      {label && <span className="text-sm font-semibold text-[#3f3225]">{label}</span>}
      <input
        ref={ref}
        className={twMerge(
          "h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]",
          className,
        )}
        {...props}
      />
      {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
    </label>
  ),
);

Input.displayName = "Input";

