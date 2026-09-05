"use client";

import { useState, type ReactNode } from "react";
import { AdminNavList } from "@/components/admin/AdminNavList";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export interface AdminShellProps {
  adminName: string | null;
  adminEmail: string;
  children: ReactNode;
}

// Deliberately visually distinct from the storefront (dark header, sidebar
// layout, no Anton display type) so it never reads as a customer-facing
// page — a real operator cue, not just decoration.
export function AdminShell({ adminName, adminEmail, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-mist/40 text-ink">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-hairline-dark bg-ink px-4 text-paper sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs uppercase tracking-widest2 md:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            {mobileNavOpen ? "Close" : "Menu"}
          </button>
          <span className="flex items-center gap-2 text-sm uppercase tracking-widest2">
            <span className="dot h-2 w-2 shrink-0 bg-paper" aria-hidden />
            2DOT Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs uppercase tracking-widest2 text-paper/60 sm:inline">
            {adminName ?? adminEmail}
          </span>
          <AdminLogoutButton />
        </div>
      </header>

      {mobileNavOpen && (
        <div id="admin-mobile-nav" className="border-b border-hairline bg-cloud md:hidden">
          <AdminNavList onNavigate={() => setMobileNavOpen(false)} />
        </div>
      )}

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-hairline bg-cloud md:block">
          <div className="sticky top-16 flex flex-col gap-1 p-4">
            <AdminNavList />
          </div>
        </aside>
        <main className="flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
