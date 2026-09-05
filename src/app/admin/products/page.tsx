import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, cn } from "@/lib/utils";
import {
  duplicateProduct,
  setProductArchived,
  setProductPublished,
} from "@/lib/admin-actions";

export const metadata: Metadata = {
  title: "Admin — Products",
};

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 5;

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]["value"];

interface AdminProductsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

function stockStatus(totalStock: number, hasVariants: boolean) {
  if (!hasVariants) return { label: "No Stock Data", tone: "outline" as const };
  if (totalStock === 0)
    return { label: "Out of Stock", tone: "outline" as const };
  if (totalStock <= LOW_STOCK_THRESHOLD)
    return { label: "Low Stock", tone: "outline" as const };
  return { label: "In Stock", tone: "default" as const };
}

function buildHref(params: { q?: string; status?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "all")
    search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

// admin/layout.tsx already enforces the ADMIN session for this route.
export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() ?? "";
  const status: StatusFilter = STATUS_TABS.some(
    (tab) => tab.value === resolvedSearchParams.status,
  )
    ? (resolvedSearchParams.status as StatusFilter)
    : "all";
  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = {};
  if (status === "archived") {
    where.archived = true;
  } else {
    where.archived = false;
    if (status === "published") where.published = true;
    if (status === "draft") where.published = false;
  }
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        price: true,
        published: true,
        archived: true,
        category: { select: { name: true } },
        images: {
          orderBy: { position: "asc" },
          take: 1,
          select: { url: true, altText: true },
        },
        variants: { select: { stock: true } },
        _count: { select: { reviews: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          title="Products"
          description={`${total} product${total === 1 ? "" : "s"}`}
        />
        <Link href="/admin/products/new">
          <Button size="sm">New Product</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ q, status: tab.value })}
              className={cn(
                "px-4 py-2 text-xs uppercase tracking-widest2",
                status === tab.value
                  ? "bg-ink text-paper"
                  : "border border-hairline text-ink hover:bg-mist",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <form method="get" className="flex items-center gap-2">
          {status !== "all" && (
            <input type="hidden" name="status" value={status} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="border border-hairline bg-cloud px-4 py-2 text-sm text-ink placeholder:text-slate/70 focus:border-ink focus:outline-none"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title={
            q || status !== "all" ? "No matching products" : "No products yet"
          }
          description={
            q || status !== "all"
              ? "Try a different search term or filter."
              : "Products you add will show up here."
          }
        />
      ) : (
        <div className="overflow-x-auto border border-hairline bg-cloud">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-widest2 text-slate">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Published</th>
                <th className="p-4 font-medium">Reviews</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );
                const stock = stockStatus(
                  totalStock,
                  product.variants.length > 0,
                );
                const image = product.images[0];

                return (
                  <tr
                    key={product.id}
                    className="border-b border-hairline last:border-0 align-top"
                  >
                    <td className="p-4">
                      <div className="flex h-12 w-12 items-center justify-center border border-hairline bg-mist text-[10px] uppercase text-slate">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.url}
                            alt={image.altText ?? product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "No image"
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-slate">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="p-4">
                      {formatPrice(product.price.toString())}
                    </td>
                    <td className="p-4">
                      <Badge tone={stock.tone}>{stock.label}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge tone={product.published ? "inverted" : "outline"}>
                        {product.archived
                          ? "Archived"
                          : product.published
                            ? "Published"
                            : "Draft"}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate">{product._count.reviews}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-xs uppercase tracking-widest2 underline underline-offset-4"
                        >
                          Edit
                        </Link>
                        <form action={duplicateProduct.bind(null, product.id)}>
                          <button
                            type="submit"
                            className="text-xs uppercase tracking-widest2 text-slate underline underline-offset-4 hover:text-ink"
                          >
                            Duplicate
                          </button>
                        </form>
                        {!product.archived && (
                          <form
                            action={setProductPublished.bind(
                              null,
                              product.id,
                              !product.published,
                            )}
                          >
                            <button
                              type="submit"
                              className="text-xs uppercase tracking-widest2 text-slate underline underline-offset-4 hover:text-ink"
                            >
                              {product.published ? "Unpublish" : "Publish"}
                            </button>
                          </form>
                        )}
                        <form
                          action={setProductArchived.bind(
                            null,
                            product.id,
                            !product.archived,
                          )}
                        >
                          <button
                            type="submit"
                            className="text-xs uppercase tracking-widest2 text-slate underline underline-offset-4 hover:text-ink"
                          >
                            {product.archived ? "Unarchive" : "Archive"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between text-xs uppercase tracking-widest2"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link
              href={buildHref({ q, status, page: page - 1 })}
              className="underline underline-offset-4"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildHref({ q, status, page: page + 1 })}
              className="underline underline-offset-4"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
