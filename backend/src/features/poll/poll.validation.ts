import { z } from "zod";

const pollOptionSchema = z.object({
  optionTextEn: z
    .string()
    .min(1, "English option text is required")
    .max(500, "Option must be less than 500 characters"),
  optionTextNp: z
    .string()
    .min(1, "Nepali option text is required")
    .max(500, "Option must be less than 500 characters"),
  optionImageUrl: z.string().url().optional(),
  optionImageUrlPublicId: z.string().min(1).optional(),
});

export const pollBaseSchema = z.object({
  titleEn: z
    .string()
    .min(1, "English poll title is required")
    .max(255, "Title must be less than 255 characters"),
  titleNp: z
    .string()
    .min(1, "Nepali poll title is required")
    .max(255, "Title must be less than 255 characters"),
  descriptionEn: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  descriptionNp: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

export const createPollSchema = pollBaseSchema.extend({
  options: z
    .array(pollOptionSchema)
    .min(2, "At least 2 options are required")
    .max(20, "Maximum 20 options allowed"),
});

export const addPollOptionSchema = z.object({
  ...pollOptionSchema.shape,
  pollId: z.uuid("Invalid poll ID"),
});

export const updatePollOptionSchema = pollOptionSchema
  .partial()
  .refine(
    (data) =>
      Boolean(data.optionTextEn || data.optionTextNp || data.optionImageUrl),
    {
      message: "At least one option field is required",
    },
  );

export const voteOnOptionSchema = z.object({
  optionId: z.uuid("Invalid option ID"),
  pollId: z.uuid("Invalid poll ID"),
  userId: z.uuid().optional(),
  ipAddress: z
    .string()
    .refine((val) => {
      // Validate IPv4 or IPv6 addresses
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i;
      return ipv4Regex.test(val) || ipv6Regex.test(val) || val === "unknown";
    }, "Invalid IP address format")
    .optional(),
});

// Types for database inserts
export type CreatePollInsert = z.infer<typeof createPollSchema> & {
  createdBy: string;
};

export type AddPollOptionInsert = z.infer<typeof addPollOptionSchema>;

export type UpdatePollOptionInsert = z.infer<typeof updatePollOptionSchema>;

export type VoteOnOptionInsert = z.infer<typeof voteOnOptionSchema> & {
  userId?: string;
  ipAddress?: string;
};
