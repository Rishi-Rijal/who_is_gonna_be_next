import cors from "cors";
import { env } from "../../config/env";

const allowedOrigins = [
  env.FRONTEND_URL,
  "https://who-is-going-to-be-next.vercel.app",
  "http://localhost:5173",
];

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
