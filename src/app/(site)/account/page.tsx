import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { AccountSettingsForm } from "@/components/account/AccountSettingsForm";
import { LogoutButton } from "@/components/account/LogoutButton";

export const metadata: Metadata = {
  title: "Account",
};

// Matches the `select` shape below exactly. Kept explicit (rather than
// relying on inference) so this still typechecks even in environments
// where `prisma generate` hasn't run yet.
type AccountReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date;
  product: { name: string; slug: string };
};

// Server component: reads the session and hits the database directly.
// middleware.ts already blocks unauthenticated requests to /account before
// this ever runs, but the redirect here stays as a second, independent
// check — authorization should never rely on a single layer.
export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const [user, reviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        product: { select: { name: true, slug: true } },
      },
    }) as Promise<AccountReview[]>,
  ]);

  if (!user) {
    // Token refers to a user that no longer exists (e.g. deleted account) —
    // treat it the same as being logged out.
    redirect("/login?callbackUrl=/account");
  }

  return (
    <PageContainer className="flex flex-col gap-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="Account" />
        <LogoutButton />
      </div>

      <div className="grid gap-12 sm:grid-cols-2">
        <section className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest2 text-slate">Profile</p>
          <p className="font-display text-2xl uppercase tracking-tightest">
            {user.name ?? "—"}
          </p>
          <p className="text-sm text-slate">{user.email}</p>
        </section>

        <section className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest2 text-slate">Account Settings</p>
          <AccountSettingsForm initialName={user.name ?? ""} />
        </section>
      </div>

      <section className="flex flex-col gap-6">
        <SectionHeading
          title="Your Reviews"
          description="2DOT doesn't process orders — this is just what you've written."
        />
        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Reviews you write on product pages will show up here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review: AccountReview) => (
              <Card key={review.id} className="flex flex-col gap-2 p-6">
                <p className="text-xs uppercase tracking-widest2 text-slate">
                  {review.product.name} · {review.rating}/5
                </p>
                {review.title && (
                  <p className="font-display text-lg uppercase tracking-tightest">
                    {review.title}
                  </p>
                )}
                <p className="text-sm text-slate">{review.body}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
