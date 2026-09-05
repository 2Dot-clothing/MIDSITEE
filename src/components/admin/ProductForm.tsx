"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface ProductFormDefaults {
  name?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  published?: boolean;
  imageUrl?: string;
  images?: { url: string }[];
  variantSize?: string;
  variantColor?: string;
  variantStock?: string;
  variants?: { size: string; color: string; stock: string }[];
  marketplaces?: { name: string; url: string }[];
}

export interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  categories: { id: string; name: string }[];
  defaultValues?: ProductFormDefaults;
  submitLabel: string;
}

export function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: ProductFormProps) {
  const [marketplaceRows, setMarketplaceRows] = useState(
    defaultValues?.marketplaces?.length
      ? defaultValues.marketplaces
      : [{ name: "", url: "" }],
  );
  const [variantRows, setVariantRows] = useState(
    defaultValues?.variants?.length
      ? defaultValues.variants
      : [{ size: "", color: "", stock: "" }],
  );
  const [imageRows, setImageRows] = useState(
    defaultValues?.images?.length
      ? defaultValues.images.map((image) => ({ url: image.url }))
      : [{ url: "" }],
  );
  const [imagesEnabled, setImagesEnabled] = useState(true);
  const [variantsEnabled, setVariantsEnabled] = useState(true);
  const [marketplacesEnabled, setMarketplacesEnabled] = useState(true);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-10">
      <div className="flex flex-col gap-5">
        <Input
          label="Product Name"
          name="name"
          placeholder="e.g. Reef Runner Shorts"
          defaultValue={defaultValues?.name}
          required
        />
        <Textarea
          label="Description"
          name="description"
          rows={5}
          placeholder="What makes this piece worth wearing."
          defaultValue={defaultValues?.description}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Price (INR)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={defaultValues?.price}
            required
          />
          <Select
            label="Category"
            name="categoryId"
            placeholder={
              categories.length ? "Select a category" : "No categories yet"
            }
            defaultValue={defaultValues?.categoryId}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaultValues?.published}
            className="h-4 w-4 border border-hairline accent-ink"
          />
          Published — visible in the shop once live
        </label>
      </div>

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest2 text-slate">
            Images
          </p>
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-slate">
            <input
              type="checkbox"
              checked={imagesEnabled}
              onChange={(event) => setImagesEnabled(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Enable
          </label>
        </div>
        {imagesEnabled &&
          imageRows.map((image, index) => (
            <div
              key={index}
              className="grid min-w-0 gap-3 border border-hairline p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
            >
              <Input
                label={`Upload image ${index + 1}`}
                name="imageFile"
                type="file"
                accept="image/png,image/jpeg,image/webp"
              />
              <Input
                label="Or use an image path or URL"
                name="imageUrl"
                type="text"
                placeholder="/assets/tee-black.png"
                value={image.url}
                onChange={(event) =>
                  setImageRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index ? { url: event.target.value } : row,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit max-w-full text-red-600"
                onClick={() =>
                  setImageRows((rows) =>
                    rows.length === 1
                      ? [{ url: "" }]
                      : rows.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
        {imagesEnabled && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() => setImageRows((rows) => [...rows, { url: "" }])}
          >
            Add Image
          </Button>
        )}
        {imagesEnabled && (
          <p className="text-xs text-slate">
            Uploaded images are saved to the site automatically.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest2 text-slate">
            Variants
          </p>
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-slate">
            <input
              type="checkbox"
              checked={variantsEnabled}
              onChange={(event) => setVariantsEnabled(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Enable
          </label>
        </div>
        {variantsEnabled &&
          variantRows.map((variant, index) => (
            <div
              key={index}
              className="grid min-w-0 gap-3 border border-hairline p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
            >
              <Input
                label={`Size ${index + 1}`}
                name="variantSize"
                placeholder="M"
                value={variant.size}
                onChange={(event) =>
                  setVariantRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, size: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Input
                label="Color"
                name="variantColor"
                placeholder="Black"
                value={variant.color}
                onChange={(event) =>
                  setVariantRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, color: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Input
                label="Stock"
                name="variantStock"
                type="number"
                min="0"
                placeholder="0"
                value={variant.stock}
                onChange={(event) =>
                  setVariantRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, stock: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit max-w-full text-red-600"
                onClick={() =>
                  setVariantRows((rows) =>
                    rows.length === 1
                      ? [{ size: "", color: "", stock: "" }]
                      : rows.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
        {variantsEnabled && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() =>
              setVariantRows((rows) => [
                ...rows,
                { size: "", color: "", stock: "" },
              ])
            }
          >
            Add Variant
          </Button>
        )}
        {variantsEnabled && (
          <p className="text-xs text-slate">
            Add one size, color, and stock quantity for this product.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest2 text-slate">
            Marketplace Links
          </p>
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-slate">
            <input
              type="checkbox"
              checked={marketplacesEnabled}
              onChange={(event) => setMarketplacesEnabled(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Enable
          </label>
        </div>
        {marketplacesEnabled &&
          marketplaceRows.map((marketplace, index) => {
            return (
              <div
                key={index}
                className="grid min-w-0 gap-3 border border-hairline p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
              >
                <Input
                  label={`Marketplace ${index + 1}`}
                  name="marketplaceName"
                  placeholder="Amazon, Myntra, Official Store"
                  value={marketplace.name}
                  onChange={(event) =>
                    setMarketplaceRows((rows) =>
                      rows.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, name: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
                <Input
                  label="Purchase URL"
                  name="marketplaceUrl"
                  type="url"
                  placeholder="https://example.com/product"
                  value={marketplace.url}
                  onChange={(event) =>
                    setMarketplaceRows((rows) =>
                      rows.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, url: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-fit max-w-full text-red-600"
                  onClick={() =>
                    setMarketplaceRows((rows) =>
                      rows.length === 1
                        ? [{ name: "", url: "" }]
                        : rows.filter((_, rowIndex) => rowIndex !== index),
                    )
                  }
                >
                  Remove
                </Button>
              </div>
            );
          })}
        {marketplacesEnabled && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() =>
              setMarketplaceRows((rows) => [...rows, { name: "", url: "" }])
            }
          >
            Add Marketplace
          </Button>
        )}
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
