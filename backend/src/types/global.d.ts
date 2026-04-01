import type { getUserByClerkId } from "../features/auth/auth.service";
import { Request } from "express";
export {};

declare global {
  namespace Express {
    interface Request {
      user?: Awaited<ReturnType<typeof getUserByClerkId>>;
    }
  }
}

export interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}
