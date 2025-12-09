import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactElement,
  cloneElement,
} from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
};

const sizeMap = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variantMap = {
  primary:
    "bg-[var(--accent)] text-white shadow-sm hover:opacity-90 active:translate-y-[1px] transition",
  ghost: "bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)]",
  outline:
    "border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--accent-soft)]",
  soft:
    "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]/80",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  asChild,
  ...props
}: ButtonProps) {
  const classes = twMerge(
    "rounded-full font-semibold inline-flex items-center justify-center gap-2",
    sizeMap[size],
    variantMap[variant],
    clsx({ "opacity-70 cursor-not-allowed": disabled || loading }),
    className,
  );

  if (asChild && children && typeof children === "object") {
    return cloneElement(children as ReactElement, {
      className: twMerge((children as ReactElement).props.className, classes),
    });
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}

