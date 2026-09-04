import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/admin-actions";

interface AdminProductEditPageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Admin — Edit Product",
};

// Core fields are wired to a real updateProduct action, prefilled from the
// existing row. Image/variant/marketplace sections stay placeholders — see
// ProductForm — until those parts are built.
export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        published: true,
        categoryId: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) {
    notFound();
  }

  const updateThisProduct = updateProduct.bind(null, product.id);

  return (
    <div className="flex flex-col gap-10">
      <SectionHeading title="Edit Product" description={product.name} />
      <ProductForm
        action={updateThisProduct}
        categories={categories}
        submitLabel="Save Changes"
        defaultValues={{
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          categoryId: product.categoryId ?? undefined,
          published: product.published,
        }}
      />
    </div>
  );
}
