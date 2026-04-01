import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/apiError";
import { getAuth } from "@clerk/express";
import { getUserByClerkId } from "./auth.service";

const normalizeRole = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.toUpperCase();
};

const getRoleFromClaims = (req: Request): string | undefined => {
  const auth = getAuth(req);
  const claims = auth.sessionClaims as
    | {
        metadata?: { role?: unknown };
        publicMetadata?: { role?: unknown };
      }
    | undefined;

  return (
    normalizeRole(claims?.metadata?.role) ??
    normalizeRole(claims?.publicMetadata?.role)
  );
};

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
      const allowedRoles = roles
        .map((role) => normalizeRole(role))
        .filter((role): role is string => Boolean(role));

      const currentRole =
        normalizeRole(req.user?.role) ?? getRoleFromClaims(req);

      if (!currentRole) {
        throw ApiError.unauthorized("Unauthorized");
      }

      const hasRole = allowedRoles.includes(currentRole);

      if (!hasRole) {
        throw ApiError.forbidden("Forbidden");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
