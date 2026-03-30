import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/apiError";
import { getAuth } from "@clerk/express";
import { getUserByClerkId } from "./auth.service";

export async function attachUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) return next(); // also for non-auth routes

  const user = await getUserByClerkId(clerkId);

  req.user = user;

  next();
}

export async function requireRoles(roles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const hasRole = roles.some((role) => req.user?.role.includes(role));

    if (!hasRole) {
      return next(new ApiError(403, "Forbidden"));
    }

    next();
  };
}
