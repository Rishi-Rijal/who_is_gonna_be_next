import { z } from "zod";
import { id } from "zod/v4/locales";

export const arresteeBaseSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameNp: z.string().min(1, "Nepali name is required"),
  age: z.number().int().positive("Age must be a positive integer"),
  profileImg: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB",
    )
    .optional(),
  postEn: z.string().min(1, "English post is required"),
  postNp: z.string().min(1, "Nepali post is required"),
  causeEn: z.string().min(1, "English cause is required"),
  causeNp: z.string().min(1, "Nepali cause is required"),
  detailsEn: z.array(z.string()).optional(),
  detailsNp: z.array(z.string()).optional(),
});

export const arresteeAddInputSchema = arresteeBaseSchema.extend({
  profileImg: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB",
    )
    .optional(),
});

export const arresteeAddInsertSchema = arresteeBaseSchema.extend({
  profileImgUrl: z.url().optional(),
  profileImgUrlPublicId: z.string().optional(),
});

export const arresteeUpdateInputSchema = arresteeBaseSchema.extend({
  id: z.uuid("Invalid arrestee ID"),
  profileImg: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB",
    )
    .optional(),
});

export const arresteeUpdateInsertSchema = arresteeBaseSchema.extend({
  id: z.uuid("Invalid arrestee ID"),
  profileImgUrl: z.url().optional(),
  profileImgUrlPublicId: z.string().optional(),
});

export type ArresteeAddInput = z.infer<typeof arresteeAddInputSchema>;
export type ArresteeAddInsert = z.infer<typeof arresteeAddInsertSchema>;
export type ArresteeUpdateInput = z.infer<typeof arresteeUpdateInputSchema>;
export type ArresteeUpdateInsert = z.infer<typeof arresteeUpdateInsertSchema>;
