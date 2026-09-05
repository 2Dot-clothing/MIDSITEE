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
}

export interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  categories: { id: string; name: string }[];
  defaultValues?: ProductFormDefaults;
  submitLabel: string;
}

export function ProductForm({ action, categories, defaultValues, submitLabel }: ProductFormProps) {
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
            placeholder={categories.length ? "Select a category" : "No categories yet"}
            defaultValue={defaultValues?.categoryId}
            options={categories.map((category) => ({ label: category.name, value: category.id }))}
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

      {/* Placeholder sections — architecture only. Real image upload, variant
          management, and marketplace-link editing are built in later parts;
          these slots exist now so that work has somewhere to plug in. */}
      <Card className="flex flex-col gap-3 p-6 opacity-60">
        <p className="text-xs uppercase tracking-widest2 text-slate">Images</p>
        <input type="file" multiple disabled className="text-sm text-slate" />
        <p className="text-xs text-slate">Image upload arrives in a later part.</p>
      </Card>

      <Card className="flex flex-col gap-3 p-6 opacity-60">
        <p className="text-xs uppercase tracking-widest2 text-slate">Variants</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Size" name="variantSize" placeholder="M" disabled />
          <Input label="Color" name="variantColor" placeholder="Black" disabled />
          <Input label="Stock" name="variantStock" type="number" placeholder="0" disabled />
        </div>
        <p className="text-xs text-slate">Variant management arrives in a later part.</p>
      </Card>

      <Card className="flex flex-col gap-3 p-6 opacity-60">
        <p className="text-xs uppercase tracking-widest2 text-slate">Marketplace Links</p>
        <Input label="External URL" name="marketplaceUrl" placeholder="https://…" disabled />
        <p className="text-xs text-slate">Marketplace linking arrives in a later part.</p>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
