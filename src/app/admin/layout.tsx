import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

// middleware.ts already blocks unauthenticated requests and non-admin
// tokens from every /admin/* route at the edge. This layout-level check is
// a deliberate second, independent layer — every admin page under this
// layout inherits it automatically, so individual pages don't need to
// re-implement the same redirect. Authorization for anything sensitive
// should never depend on a single gate.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <AdminShell adminName={session.user.name ?? null} adminEmail={session.user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
