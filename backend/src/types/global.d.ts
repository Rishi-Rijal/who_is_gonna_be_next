import type { getUserByClerkId } from "../features/auth/auth.service";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: Awaited<ReturnType<typeof getUserByClerkId>>;
    }
  }
}
