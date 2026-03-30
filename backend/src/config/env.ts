import { z } from "zod";
import { ApiError } from "../shared/utils/apiError";

export const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET is required"),
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
