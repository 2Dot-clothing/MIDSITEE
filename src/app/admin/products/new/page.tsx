import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/admin-actions";

export const metadata: Metadata = {
  title: "Admin — New Product",
};

// Core fields (name, description, price, category, published) are wired to
// a real createProduct action. Image upload, variants, and marketplace
// links are placeholder sections — see ProductForm — built in later parts.
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-10">
      <SectionHeading title="New Product" />
      <ProductForm action={createProduct} categories={categories} submitLabel="Save Product" />
    </div>
  );
}
