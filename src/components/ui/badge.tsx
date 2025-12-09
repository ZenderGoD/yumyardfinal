import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<{
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  className?: string;
}>;

const toneMap: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-[#f1e9df] text-[#5a4c3c]",
  info: "bg-[#d6e4d8] text-[#2d4a32]",
  success: "bg-[#d7f0d6] text-[#25572d]",
  warning: "bg-[#fff1d6] text-[#7a4d00]",
  danger: "bg-[#ffe0e0] text-[#9b1c1c]",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        clsx(toneMap[tone]),
        className,
      )}
    >
      {children}
    </span>
  );
}

