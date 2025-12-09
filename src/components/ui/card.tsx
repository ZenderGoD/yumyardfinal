import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={twMerge(
        "glass rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

