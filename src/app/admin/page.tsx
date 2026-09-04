import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SummaryCard } from "@/components/admin/SummaryCard";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin — Dashboard",
};

// A product with no stock recorded at all reads as out-of-stock — there's
// nothing purchasable about it either way, and this keeps the dashboard
// honest before real variant/inventory management exists.
const LOW_STOCK_THRESHOLD = 5;

// admin/layout.tsx already re-verifies the session and ADMIN role for every
// route under /admin — this page only needs to fetch data.
export default async function AdminDashboardPage() {
  const [
    totalProducts,
    publishedProducts,
    totalReviews,
    stockByProduct,
    recentProducts,
    recentReviews,
  ] = await Promise.all([
    prisma.product.count({ where: { archived: false } }),
    prisma.product.count({ where: { archived: false, published: true } }),
    prisma.review.count(),
    prisma.product.findMany({
      where: { archived: false },
      select: { id: true, variants: { select: { stock: true } } },
    }),
    prisma.product.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        published: true,
        category: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        rating: true,
        authorName: true,
        published: true,
        product: { select: { name: true } },
      },
    }),
  ]);

  const draftProducts = totalProducts - publishedProducts;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;
  for (const product of stockByProduct) {
    const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    if (stock === 0) outOfStockProducts += 1;
    else if (stock <= LOW_STOCK_THRESHOLD) lowStockProducts += 1;
  }

  return (
    <div className="flex flex-col gap-12">
      <SectionHeading title="Dashboard" description="An overview of the 2DOT catalog." />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Total Products" value={totalProducts} />
        <SummaryCard label="Published" value={publishedProducts} />
        <SummaryCard label="Draft" value={draftProducts} />
        <SummaryCard label="Low Stock" value={lowStockProducts} tone="warning" />
        <SummaryCard label="Out of Stock" value={outOfStockProducts} tone="warning" />
        <SummaryCard label="Total Reviews" value={totalReviews} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest2 text-slate">Recent Products</p>
            <Link
              href="/admin/products"
              className="text-xs uppercase tracking-widest2 underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Products you add will show up here."
            />
          ) : (
            <Card className="divide-y divide-hairline">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-slate">
                      {product.category?.name ?? "Uncategorized"} · {formatPrice(product.price.toString())}
                    </p>
                  </div>
                  <Badge tone={product.published ? "inverted" : "outline"}>
                    {product.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              ))}
            </Card>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest2 text-slate">Recent Reviews</p>
            <Link
              href="/admin/reviews"
              className="text-xs uppercase tracking-widest2 underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Customer reviews will show up here once submitted."
            />
          ) : (
            <Card className="divide-y divide-hairline">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{review.product.name}</p>
                    <p className="text-xs text-slate">
                      {review.authorName} · {review.rating}/5
                    </p>
                  </div>
                  <Badge tone={review.published ? "inverted" : "outline"}>
                    {review.published ? "Published" : "Hidden"}
                  </Badge>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
