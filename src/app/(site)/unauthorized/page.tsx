import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Unauthorized",
};

// Reached only by an authenticated non-admin whose token was rejected by
// middleware.ts on an /admin/* route (and, redundantly, by the same check
// in admin/layout.tsx). Unauthenticated visitors never land here — they're
// sent to /login instead.
export default function UnauthorizedPage() {
  return (
    <PageContainer className="flex flex-col items-center gap-6 text-center">
      <SectionHeading
        title="Unauthorized"
        description="Your account doesn't have access to this page."
        align="center"
      />
      <Link href="/">
        <Button variant="secondary" size="sm">
          Back to 2DOT
        </Button>
      </Link>
    </PageContainer>
  );
}
