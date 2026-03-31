import cors from "cors";
import { env } from "../../config/env";

const parseOriginList = (value?: string): string[] => {
  if (!value) return [];

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = Array.from(
  new Set([
    ...parseOriginList(env.FRONTEND_URLS),
    "https://who-is-going-to-be-next.vercel.app",
    "http://localhost:5173",
  ]),
);

export const corsService = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
