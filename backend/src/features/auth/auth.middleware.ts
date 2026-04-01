import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/apiError";
import { getAuth } from "@clerk/express";
import { getUserByClerkId } from "./auth.service";

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) return next();

    const user = await getUserByClerkId(clerkId);
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles = (roles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized("Unauthorized");
      }

      const hasRole = roles.some((role) => req.user?.role.includes(role));

      if (!hasRole) {
        throw ApiError.forbidden("Forbidden");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
