import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/admin-actions";

interface AdminProductEditPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Admin — Edit Product",
};

// Core fields are wired to a real updateProduct action, prefilled from the
// existing row. Image/variant/marketplace sections stay placeholders — see
// ProductForm — until those parts are built.
export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        published: true,
        categoryId: true,
        images: {
          orderBy: { position: "asc" },
          select: { url: true },
        },
        variants: {
          orderBy: { createdAt: "asc" },
          select: { size: true, color: true, stock: true },
        },
        marketplaces: {
          where: { isActive: true },
          select: {
            externalUrl: true,
            marketplace: { select: { name: true } },
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
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
          images: product.images.map((image) => ({ url: image.url })),
          variants: product.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            stock: variant.stock.toString(),
          })),
          marketplaces: product.marketplaces.map((marketplace) => ({
            name: marketplace.marketplace.name,
            url: marketplace.externalUrl,
          })),
        }}
      />
    </div>
  );
}
