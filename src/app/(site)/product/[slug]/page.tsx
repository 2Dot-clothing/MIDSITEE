import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProductPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  return {
    title: params.slug.replace(/-/g, " "),
  };
}

// Placeholder route — will load the Product by slug (with variants, images,
// marketplace links, and reviews) once the catalog is built in a later part.
export default function ProductPage({ params }: ProductPageProps) {
  return (
    <PageContainer className="flex flex-col gap-12">
      <EmptyState
        title="Product page coming online"
        description={`This route is ready for "${params.slug}" — product data, variant selection, and marketplace links will render here once the catalog exists.`}
      />
    </PageContainer>
  );
}
