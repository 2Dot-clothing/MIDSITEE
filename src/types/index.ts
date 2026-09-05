// Lightweight view-model types used by placeholder UI in Part 1.
// These intentionally mirror (but don't import) the Prisma models —
// pages that are still static shells shouldn't need a live DB
// connection just to type-check.

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
}

export interface SiteSettingsView {
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  footerTagline?: string | null;
}
