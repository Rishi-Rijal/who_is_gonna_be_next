import { z } from "zod";
import { ApiError } from "../shared/utils/apiError";

export const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET is required"),
  FRONTEND_URL: z.url().default("http://localhost:5173"),
  FRONTEND_URLS: z.string().optional(),
  CLOUDINARY_API_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
}).superRefine((values, ctx) => {
  const hasApiUrl = Boolean(values.CLOUDINARY_API_URL);
  const hasDiscreteConfig =
    Boolean(values.CLOUDINARY_CLOUD_NAME) &&
    Boolean(values.CLOUDINARY_API_KEY) &&
    Boolean(values.CLOUDINARY_API_SECRET);

  if (!hasApiUrl && !hasDiscreteConfig) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Cloudinary configuration missing: provide CLOUDINARY_API_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET",
      path: ["CLOUDINARY_API_URL"],
    });
  }
});

export type Env = z.infer<typeof envSchema>;

export const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Environment variable validation failed:",
    parsed.error.format(),
  );
  throw ApiError.badRequest(
    "Environment variable validation failed",
    parsed.error.issues,
  );
}

export const env: Env = parsed.data;
