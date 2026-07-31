import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-inverse-surface",
  secondary:
    "bg-surface-pure text-on-surface border border-border-subtle hover:border-primary",
  ghost: "bg-transparent text-on-surface hover:bg-surface-container-high",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
  lg: "px-6 py-3.5",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-label-md text-label-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
