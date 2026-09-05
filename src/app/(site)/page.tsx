import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";

const FALLBACK_PRODUCTS = [
  {
    name: "Core Tee",
    slug: "core-tee-black",
    image: "/assets/tee-black.png",
    price: null,
  },
  {
    name: "Core Tee",
    slug: "core-tee-white",
    image: "/assets/tee-white.png",
    price: null,
  },
  {
    name: "Motion Shorts",
    slug: "motion-shorts-black",
    image: "/assets/shorts-black.jpg",
    price: null,
  },
  {
    name: "Motion Shorts",
    slug: "motion-shorts-navy",
    image: "/assets/shorts-navy.jpg",
    price: null,
  },
];

export default async function HomePage() {
  const catalogProducts = await prisma.product.findMany({
    where: { published: true, archived: false },
    orderBy: { createdAt: "desc" },
    take: 4,
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
  const products =
    catalogProducts.length > 0
      ? catalogProducts.map((product) => ({
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.url,
          alt: product.images[0]?.altText ?? product.name,
          price: formatPrice(product.price.toString()),
        }))
      : FALLBACK_PRODUCTS;

  return (
    <>
      {/* Hero — the only fully-built section in Part 1. Everything below it
          is a labelled placeholder for later parts (see comment at bottom). */}
      <section className="border-b border-hairline">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-8">
          <div className="flex flex-col gap-8">
            {/* <Image src="/assets/logo.png" alt="2DOT" width={56} height={56} className="h-10 w-auto sm:h-14" priority /> */}
            <p className="text-xs uppercase tracking-widest2 text-slate">
              Performance sportswear
            </p>
            <h1 className="font-display text-6xl uppercase leading-display tracking-tightest sm:text-8xl lg:text-[7.5rem]">
              2
              <span
                className="dot mx-1 h-4 w-4 align-middle sm:h-6 sm:w-6 lg:h-8 lg:w-8"
                aria-hidden
              />
              DOT
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate">
              Built for the run, the lift, and everything between. 2DOT is
              engineered fit — precise where it counts, out of your way
              everywhere else.
            </p>
            <div>
              <Link href="/shop">
                <Button size="lg">Explore Collection</Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end lg:text-right">
            <p className="font-display text-4xl uppercase leading-none tracking-tightest sm:text-5xl">
              Fish
              <br />
              the Fit
            </p>
            <p className="max-w-[16rem] text-sm text-slate lg:text-right">
              A tagline, not a slogan. Every cut is tuned before it ships.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-hairline">
        <Container className="flex flex-col gap-10 py-16 sm:py-24">
          <SectionHeading
            title="New Arrivals"
            description="Technical essentials, tuned for every session."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={"alt" in product ? product.alt : product.name}
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
                  <span className="text-slate">{product.price ?? "View"}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-10 py-16 sm:py-24">
          <SectionHeading
            title="What Athletes Say"
            description="Customer reviews will surface here once the reviews system ships."
          />
          <div className="flex aspect-[16/5] items-center justify-center border border-dashed border-hairline text-xs uppercase tracking-widest2 text-slate">
            Reviews placeholder
          </div>
        </Container>
      </section>
    </>
  );
}
