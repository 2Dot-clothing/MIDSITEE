export interface AdminNavLink {
  href: string;
  label: string;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];
