import cors from "cors";
import { env } from "../../config/env";

const normalizeOrigin = (value: string): string => value.replace(/\/+$/, "");

const parseOriginList = (value?: string): string[] => {
  if (!value) return [];

  return value
    .split(",")
    .map((origin) => origin.trim())
    .map(normalizeOrigin)
    .filter(Boolean);
};

const allowedOrigins = Array.from(
  new Set(
    [
      normalizeOrigin(env.FRONTEND_URL),
      ...parseOriginList(env.FRONTEND_URLS),
      "https://who-is-going-to-be-next.vercel.app",
      "http://localhost:5173",
    ].map(normalizeOrigin),
  ),
);

export const corsService = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${normalizedOrigin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
