"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "@/components/admin/adminNav";

export interface AdminNavListProps {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}

function isLinkActive(pathname: string, href: string) {
  // Exact match for the dashboard root; prefix match for everything else so
  // /admin/products/new still highlights "Products".
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavList({ className, linkClassName, onNavigate }: AdminNavListProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Admin">
      {ADMIN_NAV_LINKS.map((link) => {
        const active = isLinkActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-4 py-3 text-sm uppercase tracking-widest2 transition-colors duration-250",
              active ? "bg-ink text-paper" : "text-ink hover:bg-mist",
              linkClassName
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
