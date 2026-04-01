import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/express/webhooks";
import type { Response } from "express";
import { env } from "../../config/env";
import { apiResponse } from "../../shared/utils/apiResponse";
import { ApiError } from "../../shared/utils/apiError";
import { createUserSchema } from "./auth.validation";
import { createUser, getUserByClerkId } from "./auth.service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { RequestWithRawBody } from "../../types/global";

const getWebhookHeaders = (req: RequestWithRawBody): Record<string, string> => {
  const headers = {
    "svix-id": req.header("svix-id"),
    "svix-timestamp": req.header("svix-timestamp"),
    "svix-signature": req.header("svix-signature"),
  };

  if (
    !headers["svix-id"] ||
    !headers["svix-timestamp"] ||
    !headers["svix-signature"]
  ) {
    throw new ApiError(400, "Missing svix headers");
  }

  return headers as Record<string, string>;
};

export const handleClerkWebhook = asyncHandler(
  async (req: RequestWithRawBody, res: Response) => {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    const headers = getWebhookHeaders(req);

    // Use the rawBody Buffer attached by middleware
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new ApiError(400, "Missing raw body for webhook verification");
    }

    let event: WebhookEvent;
    try {
      // Svix accepts Buffer, so we pass it directly
      event = wh.verify(rawBody, headers) as WebhookEvent;
    } catch (err) {
      throw new ApiError(400, "Invalid webhook signature");
    }

    switch (event.type) {
      case "user.created": {
        // Mapping Clerk's 'id' to your internal 'clerkId' schema
        const payload = {
          ...event.data,
          clerkId: event.data.id,
        };

        const parsed = createUserSchema.safeParse(payload);
        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0]?.message;
          throw new ApiError(
            400,
            firstIssue
              ? `Invalid user data: ${firstIssue}`
              : "Invalid user data",
          );
        }

        const existingUser = await getUserByClerkId(parsed.data.clerkId);
        if (existingUser) break;

        await createUser(parsed.data);
        break;
      }
    }

    return apiResponse.noContent(res);
  },
);
