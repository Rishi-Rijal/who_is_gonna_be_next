import { z } from "zod";

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
    updated_at: z.number("Time must be in mil.liseconds since epoch"),
    last_sign_in_at: z
      .number("Time must be in milliseconds since epoch")
      .optional(),
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
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
      lastLoginAt: data.last_sign_in_at ? new Date(data.last_sign_in_at) : null,
      createdAt: new Date(),
    };
  });

export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
