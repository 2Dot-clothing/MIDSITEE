import { z } from "zod";

// Shared password policy — kept in one place so the register form, the
// reset-password form, and the API routes can never drift out of sync.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing reset token."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const accountUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(150),
  description: z.string().trim().min(1, "Description is required.").max(5000),
  price: z.coerce.number().positive("Price must be greater than 0."),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  published: z.coerce.boolean().optional().default(false),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) =>
        value === "" || value.startsWith("/") || /^https?:\/\//.test(value),
      "Enter a valid image path or URL.",
    ),
  variantSize: z.string().trim().max(30).optional(),
  variantColor: z.string().trim().max(50).optional(),
  variantStock: z.coerce.number().int().min(0).optional(),
  marketplaceName: z.string().trim().max(100).optional(),
  marketplaceUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (value) => value === "" || /^https?:\/\//.test(value),
      "Enter a valid marketplace URL.",
    )
    .optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const reviewFormSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional(),
  body: z.string().trim().min(1, "Review is required.").max(3000),
});
