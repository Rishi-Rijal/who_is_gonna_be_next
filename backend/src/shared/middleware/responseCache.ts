import type { NextFunction, Request, RequestHandler, Response } from "express";

type CacheEntry = {
  expiresAt: number;
  statusCode: number;
  body: unknown;
};

type CacheOptions = {
  namespace: string;
  ttlSeconds: number;
  varyByUser?: boolean;
};

const responseCache = new Map<string, CacheEntry>();

const isCacheableRequest = (req: Request) => req.method === "GET";

const getCacheKey = (req: Request, options: CacheOptions) => {
  const userSuffix = options.varyByUser
    ? `:user:${req.user?.id ?? "anon"}`
    : "";

  return `${options.namespace}:${req.method}:${req.originalUrl}${userSuffix}`;
};

const cloneBody = <T>(body: T): T => {
  if (body === null || typeof body !== "object") {
    return body;
  }

  return structuredClone(body);
};

const getCachedEntry = (key: string) => {
  const cached = responseCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }

  return cached;
};

export const cacheResponse = (options: CacheOptions): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isCacheableRequest(req)) {
      return next();
    }

    const cacheKey = getCacheKey(req, options);
    const cachedEntry = getCachedEntry(cacheKey);

    if (cachedEntry) {
      res.setHeader("X-Cache", "HIT");
      return res
        .status(cachedEntry.statusCode)
        .json(cloneBody(cachedEntry.body));
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        responseCache.set(cacheKey, {
          expiresAt: Date.now() + options.ttlSeconds * 1000,
          statusCode: res.statusCode,
          body: cloneBody(body),
        });
      }

      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    }) as Response["json"];

    return next();
  };
};

export const invalidateCacheNamespace = (namespace: string) => {
  const prefix = `${namespace}:`;

  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }
};
