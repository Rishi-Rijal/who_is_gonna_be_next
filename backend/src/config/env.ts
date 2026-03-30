import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  CLERK_WEBHOOK_SECRET: z
    .string()
    .min(1, "CLERK_WEBHOOK_SECRET cannot be empty"),
});

export type Env = z.infer<typeof envSchema>;

export const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // TODO: use a ApiError class to handle this more gracefully
  console.error(
    "Environment variable validation failed:",
    parsed.error.format(),
  );
  process.exit(1);
}

export const env: Env = parsed.data;
