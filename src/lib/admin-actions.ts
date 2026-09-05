"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productFormSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

// Every action below is reachable as its own network endpoint once a page
// binds it to a <form>. The layout/middleware checks that gate the *pages*
// don't gate the actions themselves — so each one re-checks the session
// independently rather than trusting that only an admin could have
// triggered it.
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized.");
  }
  return session;
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "product";
  let candidate = root;
  let suffix = 1;

  // Small, bounded loop — collisions on admin-entered product names are
  // rare, and this table is nowhere near large enough for this to matter.
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

function parseProductForm(formData: FormData) {
  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product data.");
  }

  return parsed.data;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const slug = await uniqueSlug(data.name);

  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      published: data.published,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const slug = await uniqueSlug(data.name, id);

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      published: data.published,
      categoryId: data.categoryId ?? null,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  redirect("/admin/products");
}

export async function setProductPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { published } });
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function setProductArchived(id: string, archived: boolean) {
  await requireAdmin();
  // Archiving also unpublishes — an archived product should never still be
  // live on the storefront, even if it was published a moment ago.
  await prisma.product.update({
    where: { id },
    data: archived ? { archived: true, published: false } : { archived: false },
  });
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  const original = await prisma.product.findUnique({ where: { id } });
  if (!original) throw new Error("Product not found.");

  const slug = await uniqueSlug(`${original.name}-copy`);

  // Core fields only — images, variants, and marketplace links aren't
  // implemented yet (see /admin/products/new), so there's nothing on those
  // to duplicate. The copy starts as an unpublished draft either way.
  await prisma.product.create({
    data: {
      name: `${original.name} (Copy)`,
      slug,
      description: original.description,
      price: original.price,
      categoryId: original.categoryId,
      published: false,
      archived: false,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function moderateReview(id: string, published: boolean) {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { published } });
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}
