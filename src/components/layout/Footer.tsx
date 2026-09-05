import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";

const SHOP_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
];

// Placeholder — Part 1 defines the SiteSettings table this will eventually
// read from (whatsappUrl, instagramUrl, facebookUrl, youtubeUrl, contactEmail).
// A later part swaps this array for a fetch against SiteSettings so links are
// editable from the admin dashboard rather than hard-coded here.
const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "WhatsApp", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-ink text-paper">
      <Container className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
          <Logo invert />
          <p className="text-xs uppercase tracking-widest2 text-paper/60">
            Fish the fit
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest2 text-paper/50">Shop</p>
          {SHOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-paper/85 transition-colors duration-250 hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest2 text-paper/50">Follow</p>
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-paper/85 transition-colors duration-250 hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest2 text-paper/50">Contact</p>
          <Link
            href="/about"
            className="text-sm text-paper/85 transition-colors duration-250 hover:text-paper"
          >
            About 2DOT
          </Link>
          <Link
            href="#"
            className="text-sm text-paper/85 transition-colors duration-250 hover:text-paper"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-sm text-paper/85 transition-colors duration-250 hover:text-paper"
          >
            Terms
          </Link>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-hairline-dark py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} 2DOT. All rights reserved.</p>
        <p>Products link out to external marketplaces.</p>
      </Container>
    </footer>
  );
}
