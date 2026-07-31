import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: Props) {
  return (
    <input
      className={`w-full rounded-input border border-border-subtle bg-surface-input px-4 py-3 font-body-md text-body-md text-on-surface transition-colors placeholder:text-status-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      {...rest}
    />
  );
}
