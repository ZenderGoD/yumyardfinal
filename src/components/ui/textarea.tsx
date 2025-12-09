import { forwardRef, TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, label, hint, ...props }, ref) => (
    <label className="flex flex-col gap-1">
      {label && <span className="text-sm font-semibold text-[#3f3225]">{label}</span>}
      <textarea
        ref={ref}
        className={twMerge(
          "min-h-[96px] rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]",
          className,
        )}
        {...props}
      />
      {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
    </label>
  ),
);

Textarea.displayName = "Textarea";

