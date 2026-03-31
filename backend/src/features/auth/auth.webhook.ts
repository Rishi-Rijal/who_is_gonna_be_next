import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/express/webhooks";
import type { Request, Response } from "express";
import { env } from "../../config/env";
import { apiResponse } from "../../shared/utils/apiResponse";
import { ApiError } from "../../shared/utils/apiError";
import { createUserSchema } from "./auth.validation";
import { createUser, getUserByClerkId } from "./auth.service";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const getWebhookHeaders = (req: Request): Record<string, string> => {
  const headerNames = [
    "webhook-id",
    "webhook-timestamp",
    "webhook-signature",
  ] as const;
  const headers: Record<string, string> = {};

  for (const headerName of headerNames) {
    const value = req.header(headerName);

    if (!value) {
      throw new ApiError(400, `Missing webhook header: ${headerName}`);
    }

    headers[headerName] = value;
  }

  return headers;
};

export const handleClerkWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    const headers = getWebhookHeaders(req);

    const rawBody = (req as Request & { rawBody?: string | Buffer }).rawBody;
    if (!rawBody) {
      throw new ApiError(400, "Missing raw body for webhook verification");
    }

    let event: WebhookEvent;
    try {
      event = wh.verify(rawBody, headers) as WebhookEvent;
    } catch {
      throw new ApiError(400, "Invalid webhook");
    }

    switch (event.type) {
      case "user.created": {
        const parsed = createUserSchema.safeParse(event.data);
        if (!parsed.success) {
          throw new ApiError(400, "Invalid user data");
        }

        const user = await getUserByClerkId(parsed.data.clerkId);
        if (user) {
          break;
        }
        await createUser(parsed.data);
        break;
      }
      // TODO: Handle user updation and deletion
      // case "user.updated": // later
      //   await handleUserUpdated(event.data);
      //   break;
      // case "user.deleted": // later
      //   await handleUserDeleted(event.data);
      //   break;
    }

    return apiResponse.noContent(res);
  },
);
