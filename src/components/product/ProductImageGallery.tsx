"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ProductImage {
  url: string;
  altText: string | null;
}

export function ProductImageGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollGallery(direction: "left" | "right") {
    galleryRef.current?.scrollBy({
      left:
        direction === "right"
          ? galleryRef.current.clientWidth
          : -galleryRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  function selectImage(index: number) {
    const gallery = galleryRef.current;
    const image = gallery?.children[index] as HTMLElement | undefined;
    if (!gallery || !image) return;
    gallery.scrollTo({ left: image.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }

  return (
    <div className="relative min-w-0">
      <div
        ref={galleryRef}
        className="scrollbar-none flex snap-x gap-4 overflow-x-auto"
        onScroll={() => {
          const gallery = galleryRef.current;
          if (!gallery || images.length < 2) return;
          const nearestIndex = images.reduce((bestIndex, _, index) => {
            const child = gallery.children[index] as HTMLElement;
            const bestChild = gallery.children[bestIndex] as HTMLElement;
            return Math.abs(child.offsetLeft - gallery.scrollLeft) < Math.abs(bestChild.offsetLeft - gallery.scrollLeft)
              ? index
              : bestIndex;
          }, 0);
          setActiveIndex(nearestIndex);
        }}
        aria-label={`${productName} images`}
      >
        {images.length > 0 ? (
          images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-square min-w-full snap-center overflow-hidden bg-white"
            >
              <Image
                src={image.url}
                alt={image.altText ?? productName}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
              />
            </div>
          ))
        ) : (
          <div className="flex aspect-square min-w-full items-center justify-center bg-white text-xs uppercase tracking-widest2 text-slate">
            No image
          </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => scrollGallery("left")}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-paper/90 px-3 py-2 text-2xl leading-none text-ink shadow-sm transition-colors hover:bg-ink hover:text-paper"
          >
            &#8592;
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => scrollGallery("right")}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-paper/90 px-3 py-2 text-2xl leading-none text-ink shadow-sm transition-colors hover:bg-ink hover:text-paper"
          >
            &#8594;
          </button>
        </>
      )}

      {images.length > 0 && (
        <div className="scrollbar-none mt-4 flex min-w-full w-max justify-center gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.url}-thumbnail-${index}`}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => selectImage(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border bg-white transition-opacity ${
                activeIndex === index ? "border-ink" : "border-hairline opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
