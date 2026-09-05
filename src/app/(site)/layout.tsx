import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";

// Everything under this route group is the public storefront. Pulling this
// out of the root layout (rather than leaving Header/Footer there) is what
// lets /admin define its own chrome in src/app/admin/layout.tsx instead of
// inheriting the customer nav — a route group changes nothing about the
// URLs, only which layout wraps which pages.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </SessionProviderWrapper>
  );
}
