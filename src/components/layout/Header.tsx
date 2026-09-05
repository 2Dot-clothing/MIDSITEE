"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Swapping "Login" for "Account" here is purely a UX convenience — it
  // saves a logged-in customer a redirect, nothing more. The actual
  // protection of /account and /admin happens server-side in middleware.ts,
  // regardless of what this nav shows.
  const accountLabel = status === "authenticated" ? "Account" : "Login";
  const accountHref = status === "authenticated" ? "/account" : "/login";
  const isAdmin = session?.user?.role === "ADMIN";

  const mobileLinks = [
    ...NAV_LINKS,
    { href: accountHref, label: accountLabel },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="/" aria-label="2DOT home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-widest2 text-ink transition-colors duration-250 hover:text-slate"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {/* Search is a placeholder in Part 1 — no live search yet. */}
          <button
            type="button"
            aria-label="Search"
            className="text-sm uppercase tracking-widest2 text-ink transition-colors duration-250 hover:text-slate"
          >
            Search
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm uppercase tracking-widest2 text-ink transition-colors duration-250 hover:text-slate"
            >
              Admin
            </Link>
          )}
          <Link
            href={accountHref}
            className="text-sm uppercase tracking-widest2 text-ink transition-colors duration-250 hover:text-slate"
          >
            {accountLabel}
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="text-sm uppercase tracking-widest2 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="flex flex-col border-t border-hairline bg-paper md:hidden"
        >
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-hairline px-6 py-4 text-sm uppercase tracking-widest2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
