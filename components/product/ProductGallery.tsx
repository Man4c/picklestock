"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="hide-scrollbar flex w-full shrink-0 gap-4 overflow-x-auto pb-2 md:w-24 md:flex-col md:overflow-visible md:pb-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat gambar ${i + 1} dari ${name}`}
              aria-current={i === active}
              className={`h-24 w-20 shrink-0 overflow-hidden rounded-btn border bg-surface-container-low transition-colors ${
                i === active
                  ? "border-primary"
                  : "border-border-subtle hover:border-outline-variant"
              }`}
            >
              <Image
                src={src}
                alt=""
                width={80}
                height={96}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-card border border-border-subtle bg-surface-container-low">
        <Image
          src={images[active]}
          alt={name}
          width={400}
          height={500}
          priority
          className="h-[80%] w-[80%] object-contain"
        />
      </div>
    </div>
  );
}
