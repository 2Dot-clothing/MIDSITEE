import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { moderateReview, deleteReview } from "@/lib/admin-actions";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin — Reviews",
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]["value"];

interface AdminReviewsPageProps {
  searchParams: { status?: string };
}

// admin/layout.tsx already enforces the ADMIN session for this route.
export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const status: StatusFilter = STATUS_TABS.some((tab) => tab.value === searchParams.status)
    ? (searchParams.status as StatusFilter)
    : "all";

  const reviews = await prisma.review.findMany({
    where: status === "all" ? {} : { published: status === "published" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      authorName: true,
      published: true,
      createdAt: true,
      product: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading title="Reviews" description="Moderate customer reviews." />

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/reviews" : `/admin/reviews?status=${tab.value}`}
            className={cn(
              "px-4 py-2 text-xs uppercase tracking-widest2",
              status === tab.value ? "bg-ink text-paper" : "border border-hairline text-ink hover:bg-mist"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews to moderate"
          description="Customer reviews will show up here once submitted."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="flex flex-col gap-3 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest2 text-slate">
                    {review.product.name} · {review.rating}/5 · {review.authorName}
                  </p>
                  {review.title && (
                    <p className="font-display text-lg uppercase tracking-tightest">{review.title}</p>
                  )}
                </div>
                <Badge tone={review.published ? "inverted" : "outline"}>
                  {review.published ? "Published" : "Hidden"}
                </Badge>
              </div>
              <p className="text-sm text-slate">{review.body}</p>
              <div className="flex gap-4">
                <form action={moderateReview.bind(null, review.id, !review.published)}>
                  <button
                    type="submit"
                    className="text-xs uppercase tracking-widest2 underline underline-offset-4 hover:text-slate"
                  >
                    {review.published ? "Hide" : "Publish"}
                  </button>
                </form>
                <form action={deleteReview.bind(null, review.id)}>
                  <button
                    type="submit"
                    className="text-xs uppercase tracking-widest2 text-red-600 underline underline-offset-4"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
