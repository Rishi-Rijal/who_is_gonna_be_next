import { z } from "zod";

// used snake_case to match clerk's API response
export const createUserSchema = z
  .object({
    primary_email_address_id: z.string(
      "Primary email address ID must be a string",
    ),
    email_addresses: z
      .array(
        z.object({
          email_address: z.email("Invalid email address"),
          id: z.string(),
        }),
      )
      .min(1, "User must have at least one email address"),
    id: z.string("User ID must be a string"),
    first_name: z.string("First name must be a string"),
    last_name: z.string("Last name must be a string"),
    updated_at: z.number("Time must be in milliseconds since epoch"),
    last_sign_in_at: z
      .number("Time must be in milliseconds since epoch")
      .optional(),
  })
  .refine(
    (data) =>
      data.email_addresses.some((e) => e.id === data.primary_email_address_id),

    {
      message: "Primary email address ID must match one of the email addresses",
    },
  )
  .transform((data) => ({
    email: data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    )!.email_address,
    clerkId: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    lastLoginAt: data.last_sign_in_at ? new Date(data.last_sign_in_at) : null,

    createdAt: new Date(),
  }));

export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
