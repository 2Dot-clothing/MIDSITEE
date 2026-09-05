import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { published: true, archived: false },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      slug: true,
      price: true,
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  });

  return (
    <PageContainer className="flex flex-col gap-12">
      <SectionHeading
        title="Shop"
        description="Technical essentials, tuned for every session."
      />
      {products.length === 0 ? (
        <EmptyState
          title="Catalog coming online"
          description="Published products will appear here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-white">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].altText ?? product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest2 text-slate">
                    No image
                  </div>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-2 pt-3 text-xs uppercase tracking-widest2">
                <span>{product.name}</span>
                <span className="text-slate">
                  {formatPrice(product.price.toString())}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
