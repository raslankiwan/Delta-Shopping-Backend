"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/product-types";
import { mediaUrl } from "@/lib/media";

export function ProductGallery({
  images,
  title,
  placeholder,
}: {
  images: ProductImage[];
  title: string;
  /** Gradient + monogram fallback, rendered when the product has no images. */
  placeholder: { gradient: string; monogram: string };
}) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeId, setActiveId] = useState<string | undefined>(sorted[0]?.id);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const active = sorted.find((image) => image.id === activeId) ?? sorted[0];

  // Fall back to the gradient/monogram placeholder when there are no images, or
  // when the active image fails to load (e.g. missing file in a dev seed).
  if (!active || broken.has(active.id)) {
    return (
      <div className="product-media" style={{ background: placeholder.gradient }} aria-hidden="true">
        <span className="product-media__monogram">{placeholder.monogram}</span>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="product-media product-gallery__main">
        {/* Relative store paths + varied remote hosts across environments —
            plain <img> avoids coupling this to next/image's remotePatterns allowlist. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(active.url)}
          alt={active.alt ?? title}
          onError={() => setBroken((prev) => new Set(prev).add(active.id))}
        />
      </div>
      {sorted.length > 1 && (
        <div className="product-gallery__thumbs" role="tablist" aria-label={title}>
          {sorted.map((image) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={image.id === active.id}
              className={`product-gallery__thumb${image.id === active.id ? " product-gallery__thumb--active" : ""}`}
              onClick={() => setActiveId(image.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(image.url)} alt={image.alt ?? title} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
