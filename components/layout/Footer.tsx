import { SITE_NAME, FOOTER_YEAR } from "@/lib/constants";

const LINKS = ["About Us", "Shipping Policy", "Terms of Service", "Contact"];

export function Footer() {
  return (
    <footer className="mt-12 flex w-full flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-margin-page py-stack-section md:flex-row">
      <div className="font-display-logo text-display-logo text-primary">
        {SITE_NAME}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {LINKS.map((label) => (
          <span
            key={label}
            className="font-body-sm text-body-sm text-status-muted"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="text-center font-body-sm text-body-sm text-secondary md:text-right">
        © {FOOTER_YEAR} {SITE_NAME}. Engineered for Performance.
      </div>
    </footer>
  );
}
