import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines conditional class names (clsx) and then dedupes conflicting
// Tailwind utility classes (twMerge) so overrides passed via `className`
// props always win over a component's own defaults.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency: string = "INR") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Basic ASCII slugify — good enough for admin-entered product/category
// names. Uniqueness (appending a short suffix on collision) is handled by
// the caller, since that requires a database lookup this function shouldn't
// know about.
export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
