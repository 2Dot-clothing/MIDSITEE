import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <PageContainer className="flex flex-col gap-12">
      <SectionHeading title="About 2DOT" />
      <div className="max-w-2xl space-y-6 text-sm leading-relaxed text-slate">
        <p>
          2DOT is a performance sportswear brand built around one idea: fit
          decides everything. Fish the fit — find the cut that disappears
          once you&apos;re moving.
        </p>
        <p>
          This page is a structural placeholder for Part 1. Full brand
          story, imagery, and editorial content will be added as the site
          develops.
        </p>
      </div>
    </PageContainer>
  );
}
