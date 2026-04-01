import { Request, Response } from "express";
import { z } from "zod";
import {
  createPoll,
  getAllPolls,
  getPollById,
  addOptionToPoll,
  updatePollOption,
  getPollOptionById,
  voteOnOption,
  getUserVoteOnPoll,
  deletePoll,
  deletePollOption,
} from "./poll.services";
import {
  createPollSchema,
  addPollOptionSchema,
  updatePollOptionSchema,
  voteOnOptionSchema,
} from "./poll.validation";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { apiResponse } from "../../shared/utils/apiResponse";
import { ApiError } from "../../shared/utils/apiError";
import { invalidateCacheNamespace } from "../../shared/middleware/responseCache";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../shared/utils/cloudinary";

const POLL_OPTION_UPLOAD_FOLDER = "poll-options";

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (Array.isArray(req.files)) {
    return req.files;
  }

  if (req.file) {
    return [req.file];
  }

  return [];
};

const getUploadedFileByFieldname = (
  req: Request,
  fieldname: string,
): Express.Multer.File | undefined => {
  return getUploadedFiles(req).find((file) => file.fieldname === fieldname);
};

const parsePollOptions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest("Poll options are required");
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw ApiError.badRequest("Invalid poll options format");
  }
};

const uploadOptionImage = async (file: Express.Multer.File) => {
  return uploadToCloudinary(
    file.buffer,
    file.mimetype,
    POLL_OPTION_UPLOAD_FOLDER,
  );
};

const deleteUploadedImages = async (publicIds: string[]) => {
  await Promise.all(
    publicIds.map(async (publicId) => {
      try {
        await deleteFromCloudinary(publicId);
      } catch {
        // Ignore cleanup errors so the original request error is preserved.
      }
    }),
  );
};

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
    const uploadedPublicIds: string[] = [];
    const optionsWithImages = [] as unknown[];

    try {
      const options = parsePollOptions(req.body.options);

      for (let index = 0; index < options.length; index += 1) {
        const option = options[index] as Record<string, unknown>;
        const file = getUploadedFileByFieldname(req, `optionImage_${index}`);

        if (file) {
          const uploadedImage = await uploadOptionImage(file);
          uploadedPublicIds.push(uploadedImage.public_id);

          optionsWithImages.push({
            ...option,
            optionImageUrl: uploadedImage.secure_url,
            optionImageUrlPublicId: uploadedImage.public_id,
          });
        } else {
          optionsWithImages.push(option);
        }
      }
    } catch (error) {
      await deleteUploadedImages(uploadedPublicIds);
      throw error;
    }

    const validationResult = createPollSchema.safeParse({
      ...req.body,
      options: optionsWithImages,
    });
    if (!validationResult.success) {
      await deleteUploadedImages(uploadedPublicIds);
      throw ApiError.badRequest(validationResult.error.issues[0].message);
    }

    try {
      const poll = await createPoll({
        ...validationResult.data,
        createdBy: req.user?.id!,
      });

      invalidateCacheNamespace("poll");

      return apiResponse.created(res, poll, {
        message: "Poll created successfully",
      });
    } catch (error) {
      await deleteUploadedImages(uploadedPublicIds);
      throw error;
    }
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

    const uploadedPublicIds: string[] = [];
    const file = getUploadedFileByFieldname(req, "optionImage");
    let uploadedImageData:
      | { optionImageUrl: string; optionImageUrlPublicId: string }
      | undefined;

    if (file) {
      const uploadedImage = await uploadOptionImage(file);
      uploadedPublicIds.push(uploadedImage.public_id);
      uploadedImageData = {
        optionImageUrl: uploadedImage.secure_url,
        optionImageUrlPublicId: uploadedImage.public_id,
      };
    }

    const validationResult = addPollOptionSchema.safeParse({
      ...req.body,
      pollId,
      ...uploadedImageData,
    });
    if (!validationResult.success) {
      await deleteUploadedImages(uploadedPublicIds);
      throw ApiError.badRequest(validationResult.error.issues[0].message);
    }

    try {
      const option = await addOptionToPoll(validationResult.data);

      invalidateCacheNamespace("poll");

      return apiResponse.created(res, option, {
        message: "Option added successfully",
      });
    } catch (error) {
      await deleteUploadedImages(uploadedPublicIds);
      throw error;
    }
  },
);

// Update a poll option
export const updatePollOptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const optionIdResult = z.uuid().safeParse(req.params.optionId);
    if (!optionIdResult.success) {
      throw ApiError.badRequest("Invalid option ID");
    }

    const existingOption = await getPollOptionById(optionIdResult.data);
    if (!existingOption) {
      throw ApiError.notFound("Option not found");
    }

    const file = getUploadedFileByFieldname(req, "optionImage");
    let uploadedImageData:
      | { optionImageUrl: string; optionImageUrlPublicId: string }
      | undefined;
    let uploadedPublicId: string | undefined;

    if (file) {
      const uploadedImage = await uploadOptionImage(file);
      uploadedPublicId = uploadedImage.public_id;
      uploadedImageData = {
        optionImageUrl: uploadedImage.secure_url,
        optionImageUrlPublicId: uploadedImage.public_id,
      };
    }

    const validationResult = updatePollOptionSchema.safeParse({
      ...req.body,
      ...uploadedImageData,
    });

    if (!validationResult.success) {
      if (uploadedPublicId) {
        await deleteUploadedImages([uploadedPublicId]);
      }
      throw ApiError.badRequest(validationResult.error.issues[0].message);
    }

    try {
      const option = await updatePollOption(
        optionIdResult.data,
        validationResult.data,
      );

      if (!option) {
        throw ApiError.notFound("Option not found");
      }

      if (
        uploadedPublicId &&
        existingOption.optionImageUrlPublicId &&
        existingOption.optionImageUrlPublicId !== uploadedPublicId
      ) {
        try {
          await deleteFromCloudinary(existingOption.optionImageUrlPublicId);
        } catch {
          // Keep update successful even if image cleanup fails.
        }
      }

      invalidateCacheNamespace("poll");

      return apiResponse.success(res, option, {
        message: "Option updated successfully",
      });
    } catch (error) {
      if (uploadedPublicId) {
        await deleteUploadedImages([uploadedPublicId]);
      }
      throw error;
    }
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

      const messageByAction = {
        created: "Vote recorded successfully",
        updated: "Vote updated successfully",
        unchanged: "Vote was already on this option",
      } as const;

      return apiResponse.success(res, vote, {
        statusCode: 201,
        message: messageByAction[vote.action],
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

    const optionImages = poll.options
      .map((option) => option.optionImageUrlPublicId)
      .filter((publicId): publicId is string => Boolean(publicId));

    await deletePoll(pollId);

    await deleteUploadedImages(optionImages);
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

    const existingOption = await getPollOptionById(optionId.data);
    if (!existingOption) {
      throw ApiError.notFound("Option not found");
    }

    await deletePollOption(optionId.data);

    if (existingOption.optionImageUrlPublicId) {
      try {
        await deleteFromCloudinary(existingOption.optionImageUrlPublicId);
      } catch {
        // Keep delete successful even if media cleanup fails.
      }
    }

    invalidateCacheNamespace("poll");

    return apiResponse.success(
      res,
      { id: optionId.data },
      { statusCode: 200, message: "Option deleted successfully" },
    );
  },
);
