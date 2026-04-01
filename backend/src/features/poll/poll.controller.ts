import { Request, Response } from "express";
import { z } from "zod";
import {
  createPoll,
  getAllPolls,
  getPollById,
  addOptionToPoll,
  voteOnOption,
  getUserVoteOnPoll,
  deletePoll,
  deletePollOption,
} from "./poll.services";
import {
  createPollSchema,
  addPollOptionSchema,
  voteOnOptionSchema,
} from "./poll.validation";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { apiResponse } from "../../shared/utils/apiResponse";
import { ApiError } from "../../shared/utils/apiError";
import { invalidateCacheNamespace } from "../../shared/middleware/responseCache";

// Helper to get client IP address
const getClientIP = (req: Request): string => {
  // x-forwarded-for (for proxies)
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  // CloudFlare
  const cfConnecting = req.headers["cf-connecting-ip"];
  if (typeof cfConnecting === "string") {
    return cfConnecting;
  }

  // x-real-ip (Nginx)
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") {
    return realIp;
  }

  // Fallback to Express req.ip
  return req.ip || "unknown";
};

const parseIdFromParams = (req: Request): string => {
  const idResult = z.uuid().safeParse(req.params.id);
  if (!idResult.success) {
    throw ApiError.badRequest("Invalid poll ID");
  }
  return idResult.data;
};

export const createPollController = asyncHandler(
  async (req: Request, res: Response) => {
    const validationResult = createPollSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw ApiError.badRequest(validationResult.error.issues[0].message);
    }

    const poll = await createPoll({
      ...validationResult.data,
      createdBy: req.user?.id!,
    });

    invalidateCacheNamespace("poll");

    return apiResponse.created(res, poll, {
      message: "Poll created successfully",
    });
  },
);

// Get all polls
export const getAllPollsController = asyncHandler(
  async (req: Request, res: Response) => {
    const polls = await getAllPolls();

    return apiResponse.success(res, polls, {
      statusCode: 200,
      message: "Polls retrieved successfully",
    });
  },
);

// Get a specific poll by ID
export const getPollByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const pollId = parseIdFromParams(req);

    const poll = await getPollById(pollId);
    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    // Get user's vote if they're authenticated
    const userId = req?.user?.id;
    let userVote = null;
    if (userId) {
      userVote = await getUserVoteOnPoll(pollId, userId);
    }

    return apiResponse.success(
      res,
      { poll, userVote },
      { statusCode: 200, message: "Poll retrieved successfully" },
    );
  },
);

// Add a new option to a poll
export const addOptionToPollController = asyncHandler(
  async (req: Request, res: Response) => {
    const pollId = parseIdFromParams(req);

    const validationResult = addPollOptionSchema.safeParse({
      ...req.body,
      pollId,
    });
    if (!validationResult.success) {
      throw ApiError.badRequest(validationResult.error.issues[0].message);
    }

    const option = await addOptionToPoll(validationResult.data);

    return apiResponse.created(res, option, {
      message: "Option added successfully",
    });
  },
);

// Vote on an option
export const voteOnOptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const validationResult = voteOnOptionSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw ApiError.badRequest(validationResult.error.issues[0].message);
    }

    try {
      // Get user ID if authenticated, otherwise use IP address
      const userId = req?.user?.id;
      const ipAddress = getClientIP(req);

      const vote = await voteOnOption({
        ...validationResult.data,
        userId,
        ipAddress,
      });

      invalidateCacheNamespace("poll");

      return apiResponse.success(res, vote, {
        statusCode: 201,
        message: "Vote recorded successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Voting failed";
      throw ApiError.badRequest(message);
    }
  },
);

// Delete a poll
export const deletePollController = asyncHandler(
  async (req: Request, res: Response) => {
    const pollId = parseIdFromParams(req);

    const poll = await getPollById(pollId);
    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    // Check if user is the creator or admin
    const userId = req?.user?.id;
    const isAdmin = req?.user?.role === "ADMIN";
    if (poll.createdBy !== userId && !isAdmin) {
      throw ApiError.forbidden("You can only delete your own polls");
    }

    await deletePoll(pollId);
    invalidateCacheNamespace("poll");

    return apiResponse.success(
      res,
      { id: pollId },
      { statusCode: 200, message: "Poll deleted successfully" },
    );
  },
);

// Delete a poll option
export const deletePollOptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const optionId = z.uuid().safeParse(req.params.optionId);
    if (!optionId.success) {
      throw ApiError.badRequest("Invalid option ID");
    }

    await deletePollOption(optionId.data);
    invalidateCacheNamespace("poll");

    return apiResponse.success(
      res,
      { id: optionId.data },
      { statusCode: 200, message: "Option deleted successfully" },
    );
  },
);
