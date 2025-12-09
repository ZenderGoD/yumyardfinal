import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  title: string;
  value: ReactNode;
  chip?: string;
  className?: string;
};

export function StatCard({ title, value, chip, className }: Props) {
  return (
    <div
      className={twMerge(
        "rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--muted)]">{title}</p>
        {chip && (
          <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--accent)]">
            {chip}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-[#2c2218]">{value}</div>
    </div>
  );
}

