import { Weight, Ruler, Grip, Layers } from "lucide-react";
import type { ProductSpecs } from "@/lib/types";

export function SpecGrid({ specs }: { specs: ProductSpecs }) {
  const items = [
    { Icon: Weight, label: "Berat", value: specs.weight },
    { Icon: Ruler, label: "Ketebalan", value: specs.thickness },
    { Icon: Grip, label: "Permukaan", value: specs.surface },
    { Icon: Layers, label: "Inti", value: specs.core },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 py-2">
      {items.map(({ Icon, label, value }) => (
        <div
          key={label}
          className="rounded-card border border-border-subtle bg-surface-input p-padding-card"
        >
          <Icon size={20} aria-hidden="true" className="mb-2 text-secondary" />
          <dt className="font-eyebrow text-eyebrow uppercase text-secondary">
            {label}
          </dt>
          <dd className="mt-1 font-label-md text-label-md text-on-surface">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
