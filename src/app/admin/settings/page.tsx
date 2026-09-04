import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Admin — Settings",
};

// Sections only, per the Part 3 brief — SiteSettings already exists in the
// schema (Part 1) and is read here so fields prefill where data exists, but
// saving is intentionally not wired up yet; that ships when settings
// functionality is expanded in a later part.
export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        title="Settings"
        description="Site-wide configuration. Editing arrives in a later part."
      />

      <Card className="flex flex-col gap-5 p-6">
        <p className="text-xs uppercase tracking-widest2 text-slate">Brand Information</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Footer Tagline" defaultValue={settings?.footerTagline ?? ""} disabled />
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <p className="text-xs uppercase tracking-widest2 text-slate">Contact Information</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Contact Email" defaultValue={settings?.contactEmail ?? ""} disabled />
          <Input label="Contact Phone" defaultValue={settings?.contactPhone ?? ""} disabled />
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <p className="text-xs uppercase tracking-widest2 text-slate">Social Links</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="WhatsApp" defaultValue={settings?.whatsappUrl ?? ""} disabled />
          <Input label="Instagram" defaultValue={settings?.instagramUrl ?? ""} disabled />
          <Input label="Facebook" defaultValue={settings?.facebookUrl ?? ""} disabled />
          <Input label="YouTube" defaultValue={settings?.youtubeUrl ?? ""} disabled />
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <p className="text-xs uppercase tracking-widest2 text-slate">Marketplace Configuration</p>
        <p className="text-sm text-slate">
          Marketplaces (Amazon, Myntra, Official Store, etc.) and per-product links are managed
          from the Marketplace model added in Part 1. Configuration UI here arrives once the
          marketplace-links feature is built.
        </p>
      </Card>
    </div>
  );
}
