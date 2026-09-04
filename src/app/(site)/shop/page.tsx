import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Shop",
};

// Part 1 ships the route and layout only. Product data, filtering, and
// pagination are built once the catalog and admin dashboard exist.
export default function ShopPage() {
  return (
    <PageContainer className="flex flex-col gap-12">
      <SectionHeading
        title="Shop"
        description="The full collection will list here, pulled from the product catalog."
      />
      <EmptyState
        title="Catalog coming online"
        description="Products, categories, and marketplace links will populate this page in a later part."
      />
    </PageContainer>
  );
}
