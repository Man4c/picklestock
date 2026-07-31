import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Wajib — pembaca layar tidak dapat membaca ikon. */
  label: string;
  children: ReactNode;
};

export function IconButton({ label, className = "", children, ...rest }: Props) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-btn p-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
