"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productFormSchema, reviewFormSchema } from "@/lib/validations";
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
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

function parseProductForm(formData: FormData) {
  const optionalText = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const optionalNumber = (name: string) => {
    const value = optionalText(name);
    return value === "" ? undefined : value;
  };

  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: optionalText("categoryId"),
    published: formData.get("published") === "on",
    imageUrl: optionalText("imageUrl"),
    variantSize: optionalText("variantSize"),
    variantColor: optionalText("variantColor"),
    variantStock: optionalNumber("variantStock"),
    marketplaceName: optionalText("marketplaceName"),
    marketplaceUrl: optionalText("marketplaceUrl"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product data.");
  }

  return parsed.data;
}

function marketplaceData(formData: FormData) {
  const names = formData.getAll("marketplaceName");
  const urls = formData.getAll("marketplaceUrl");
  const entries: {
    externalUrl: string;
    marketplace: {
      connectOrCreate: {
        where: { name: string };
        create: { name: string; slug: string };
      };
    };
  }[] = [];

  for (let index = 0; index < Math.max(names.length, urls.length); index += 1) {
    const name = names[index];
    const url = urls[index];
    if (typeof name !== "string" || typeof url !== "string") continue;
    if (!name.trim() && !url.trim()) continue;
    if (!name.trim() || !url.trim() || !/^https?:\/\//.test(url.trim())) {
      throw new Error("Each marketplace must have a name and valid URL.");
    }
    entries.push({
      externalUrl: url.trim(),
      marketplace: {
        connectOrCreate: {
          where: { name: name.trim() },
          create: {
            name: name.trim(),
            slug: slugify(name.trim()) || "marketplace",
          },
        },
      },
    });
  }
  return entries;
}

function variantData(formData: FormData) {
  const sizes = formData.getAll("variantSize");
  const colors = formData.getAll("variantColor");
  const stocks = formData.getAll("variantStock");
  const entries: { size: string; color: string; stock: number }[] = [];

  for (
    let index = 0;
    index < Math.max(sizes.length, colors.length, stocks.length);
    index += 1
  ) {
    const size = sizes[index];
    const color = colors[index];
    const stock = stocks[index];
    if (
      typeof size !== "string" ||
      typeof color !== "string" ||
      typeof stock !== "string"
    )
      continue;
    if (!size.trim() && !color.trim() && !stock.trim()) continue;
    const stockValue = Number(stock);
    if (
      !size.trim() ||
      !color.trim() ||
      !Number.isInteger(stockValue) ||
      stockValue < 0
    ) {
      throw new Error(
        "Each variant must have a size, color, and valid stock quantity.",
      );
    }
    entries.push({ size: size.trim(), color: color.trim(), stock: stockValue });
  }
  return entries;
}

async function saveImageFile(imageFile: File) {
  const extensions = new Map([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
  ]);
  const extension = extensions.get(imageFile.type);
  if (!extension)
    throw new Error("Only JPG, PNG, and WebP images are supported.");
  if (imageFile.size > 5 * 1024 * 1024)
    throw new Error("Image must be smaller than 5 MB.");
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  await writeFile(
    path.join(uploadDirectory, filename),
    Buffer.from(await imageFile.arrayBuffer()),
  );
  return `/uploads/${filename}`;
}

async function resolveImageUrls(formData: FormData) {
  const files = formData.getAll("imageFile");
  const urls = formData.getAll("imageUrl");
  const imageUrls: string[] = [];
  const total = Math.max(files.length, urls.length);

  for (let index = 0; index < total; index += 1) {
    const file = files[index];
    if (file instanceof File && file.size > 0) {
      imageUrls.push(await saveImageFile(file));
      continue;
    }
    const url = urls[index];
    if (typeof url === "string" && url.trim()) imageUrls.push(url.trim());
  }

  return imageUrls;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const imageUrls = await resolveImageUrls(formData);
  const slug = await uniqueSlug(data.name);
  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      published: data.published,
      categoryId: data.categoryId,
      images: { create: imageUrls.map((url, position) => ({ url, position })) },
      variants: { create: variantData(formData) },
      marketplaces: { create: marketplaceData(formData) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const imageUrls = await resolveImageUrls(formData);
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
      images: {
        deleteMany: {},
        create: imageUrls.map((url, position) => ({ url, position })),
      },
      variants: { deleteMany: {}, create: variantData(formData) },
      marketplaces: { deleteMany: {}, create: marketplaceData(formData) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/products");
}

export async function setProductPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { published } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
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
  revalidatePath("/shop");
  revalidatePath("/");
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

export async function createReview(productId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Please log in to write a review.");

  const parsed = reviewFormSchema.safeParse({
    rating: formData.get("rating"),
    title: typeof formData.get("title") === "string" ? formData.get("title") : "",
    body: typeof formData.get("body") === "string" ? formData.get("body") : "",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid review.");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, published: true, archived: false },
    select: { slug: true },
  });
  if (!product) throw new Error("Product not found.");

  await prisma.review.create({
    data: {
      productId,
      userId: session.user.id,
      authorName: session.user.name ?? session.user.email ?? "Customer",
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      published: true,
    },
  });

  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  redirect(`/product/${product.slug}`);
}
