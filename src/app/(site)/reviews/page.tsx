import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Reviews",
};

// The Review model exists in the schema; the reviews system itself
// (submission, moderation, display) is explicitly out of scope for Part 1.
export default function ReviewsPage() {
  return (
    <PageContainer className="flex flex-col gap-12">
      <SectionHeading
        title="Reviews"
        description="Customer reviews will appear here once the reviews system is built."
      />
      <EmptyState
        title="No reviews system yet"
        description="This route and its database model are ready — moderation and display logic come in a later part."
      />
    </PageContainer>
  );
}
