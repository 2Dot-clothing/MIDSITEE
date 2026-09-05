import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { PageContainer } from "@/components/layout/PageContainer";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { authOptions } from "@/lib/auth";
import { createReview } from "@/lib/admin-actions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function marketplaceLogo(name: string) {
  const normalizedName = name.toLowerCase().replace(/[^a-z]/g, "");
  if (normalizedName.includes("amazon")) return "/assets/amazon.png";
  if (normalizedName.includes("flipkart")) return "/assets/flipkart.png";
  if (normalizedName.includes("myntra")) return "/assets/myntra.jpg";
  return null;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
  };
}

// Placeholder route — will load the Product by slug (with variants, images,
// marketplace links, and reviews) once the catalog is built in a later part.
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, published: true, archived: false },
    select: {
      name: true,
      description: true,
      price: true,
      images: {
        orderBy: { position: "asc" },
        select: { url: true, altText: true },
      },
      variants: {
        orderBy: { createdAt: "asc" },
        select: { size: true, color: true, stock: true },
      },
      marketplaces: {
        where: { isActive: true },
        select: {
          id: true,
          externalUrl: true,
          marketplace: { select: { name: true } },
        },
      },
      reviews: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, authorName: true, rating: true, title: true, body: true },
      },
    },
  });

  if (!product) notFound();
  const session = await getServerSession(authOptions);
  const submitReview = createReview.bind(null, product.id);

  return (
    <PageContainer className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductImageGallery images={product.images} productName={product.name} />
      <div className="flex flex-col gap-6 lg:py-8">
        <h1 className="font-display text-4xl uppercase tracking-tightest sm:text-6xl">
          {product.name}
        </h1>
        <p className="text-lg">{formatPrice(product.price.toString())}</p>
        <p className="max-w-xl text-sm leading-relaxed text-slate">
          {product.description}
        </p>
        {product.variants.length > 0 && (
          <div className="border-y border-hairline py-5">
            <p className="mb-3 text-xs uppercase tracking-widest2 text-slate">
              Available variant
            </p>
            {product.variants.map((variant) => (
              <p key={`${variant.size}-${variant.color}`} className="text-sm">
                {variant.color} / {variant.size} ·{" "}
                {variant.stock > 0
                  ? `${variant.stock} in stock`
                  : "Out of stock"}
              </p>
            ))}
          </div>
        )}
        {product.marketplaces.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-xs uppercase tracking-widest2 text-slate">
              Available at
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {product.marketplaces.map((marketplace) => (
                <a
                  key={marketplace.id}
                  href={marketplace.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Buy on ${marketplace.marketplace.name}`}
                  title={`Buy on ${marketplace.marketplace.name}`}
                  className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-ink bg-paper p-2 transition-transform hover:scale-105"
                >
                  {marketplaceLogo(marketplace.marketplace.name) ? (
                    <Image
                      src={marketplaceLogo(marketplace.marketplace.name)!}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full rounded-full object-contain"
                    />
                  ) : (
                    <span className="text-center text-[10px] uppercase leading-tight tracking-widest2">
                      {marketplace.marketplace.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <section className="lg:col-span-2 border-t border-hairline pt-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-3xl uppercase tracking-tightest">Write a Review</h2>
            {session?.user ? (
              <form action={submitReview} className="flex max-w-md flex-col gap-4">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-widest2 text-slate">
                  Rating
                  <select name="rating" defaultValue="5" className="border border-hairline bg-cloud px-4 py-3 text-sm text-ink">
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-widest2 text-slate">
                  Title
                  <input name="title" placeholder="Your headline" className="border border-hairline bg-cloud px-4 py-3 text-sm text-ink" />
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-widest2 text-slate">
                  Review
                  <textarea name="body" rows={5} required placeholder="What did you think?" className="border border-hairline bg-cloud px-4 py-3 text-sm text-ink" />
                </label>
                <button type="submit" className="w-fit bg-ink px-6 py-3 text-xs uppercase tracking-widest2 text-paper">Submit Review</button>
              </form>
            ) : (
              <p className="text-sm text-slate">
                <Link href={`/login?callbackUrl=${encodeURIComponent(`/product/${slug}`)}`} className="text-ink underline underline-offset-4">Log in</Link> to review this product.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-3xl uppercase tracking-tightest">Reviews ({product.reviews.length})</h2>
            {product.reviews.length === 0 ? <p className="text-sm text-slate">Be the first to review this product.</p> : (
              <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
                {product.reviews.map((review) => (
                  <article key={review.id} className="flex flex-col gap-2 py-5">
                    <p className="text-xs uppercase tracking-widest2 text-slate">{review.authorName} · {review.rating}/5</p>
                    {review.title && <h3 className="font-display text-xl uppercase tracking-tightest">{review.title}</h3>}
                    <p className="text-sm leading-relaxed text-slate">{review.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
