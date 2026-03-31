import { z } from "zod";

const epochToDate = (value: unknown): Date | null => {
  if (value === null || value === undefined) return null;

  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number" || !Number.isFinite(numeric)) return null;

  // Unix seconds are typically 10 digits; milliseconds are 13 digits.
  const millis = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  const parsed = new Date(millis);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// used snake_case to match clerk's API response
export const createUserSchema = z
  .object({
    primary_email_address_id: z.string().nullable().optional(),
    email_addresses: z
      .array(
        z.object({
          email_address: z.email("Invalid email address"),
          id: z.string(),
        }),
      )
      .min(1, "User must have at least one email address"),
    id: z.string("User ID must be a string"),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    updated_at: z.union([z.number(), z.string(), z.null()]).optional(),
    last_sign_in_at: z.union([z.number(), z.string(), z.null()]).optional(),
  })
  .refine(
    (data) => {
      if (!data.primary_email_address_id) {
        return data.email_addresses.length > 0;
      }

      return data.email_addresses.some(
        (e) => e.id === data.primary_email_address_id,
      );
    },

    {
      message: "Primary email address ID must match one of the email addresses",
    },
  )
  .transform((data) => {
    const primaryEmail = data.primary_email_address_id
      ? data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      : data.email_addresses[0];

    return {
      email: primaryEmail!.email_address,
      clerkId: data.id,
      firstName: data.first_name?.trim() || "Unknown",
      lastName: data.last_name?.trim() || null,
      updatedAt: epochToDate(data.updated_at) ?? new Date(),
      lastLoginAt: epochToDate(data.last_sign_in_at),
      createdAt: new Date(),
    };
  });

export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
