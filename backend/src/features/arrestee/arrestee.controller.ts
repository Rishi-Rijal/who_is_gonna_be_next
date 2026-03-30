import { Request } from "express";
import { z } from "zod";
import {
  addDislike,
  addLike,
  createArrestee,
  deleteArrestee,
  getAllArrestees,
  getArresteeById,
  removeDislike,
  removeLike,
  updateArrestee,
} from "./arrestee.services";
import {
  arresteeAddInsertSchema,
  arresteeUpdateInsertSchema,
} from "./arrestee.validation";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { apiResponse } from "../../shared/utils/apiResponse";
import { ApiError } from "../../shared/utils/apiError";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../shared/utils/cloudinary";

const ARRESTEE_UPLOAD_FOLDER = "arrestees";

const parseIdFromParams = (req: Request): string => {
  const idResult = z.uuid().safeParse(req.params.id);
  if (!idResult.success) {
    throw ApiError.badRequest("Invalid arrestee id");
  }
  return idResult.data;
};

const parseStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated values.
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getBasePayload = (req: Request) => {
  return {
    nameEn: req.body.nameEn,
    nameNp: req.body.nameNp,
    age: Number(req.body.age),
    postEn: req.body.postEn,
    postNp: req.body.postNp,
    causeEn: req.body.causeEn,
    causeNp: req.body.causeNp,
    detailsEn: parseStringArray(req.body.detailsEn),
    detailsNp: parseStringArray(req.body.detailsNp),
  };
};

export const getAllArresteesController = asyncHandler(async (_req, res) => {
  const result = await getAllArrestees();
  return apiResponse.success(res, result, { message: "Arrestees fetched" });
});

export const getArresteeByIdController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const result = await getArresteeById(id);

  if (!result) {
    throw ApiError.notFound("Arrestee not found");
  }

  return apiResponse.success(res, result, { message: "Arrestee fetched" });
});

export const createArresteeController = asyncHandler(async (req, res) => {
  let uploadedPublicId: string | null = null;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      ARRESTEE_UPLOAD_FOLDER,
    );
    uploadedPublicId = uploadResult.public_id;

    req.body.profileImgUrl = uploadResult.secure_url;
    req.body.profileImgUrlPublicId = uploadResult.public_id;
  }

  const payload = {
    ...getBasePayload(req),
    profileImgUrl: req.body.profileImgUrl,
    profileImgUrlPublicId: req.body.profileImgUrlPublicId,
  };

  const parsed = arresteeAddInsertSchema.safeParse(payload);

  if (!parsed.success) {
    if (uploadedPublicId) {
      await deleteFromCloudinary(uploadedPublicId);
    }
    throw ApiError.badRequest("Invalid arrestee data", parsed.error.issues);
  }

  const result = await createArrestee(parsed.data);
  return apiResponse.created(res, result, { message: "Arrestee created" });
});

export const updateArresteeController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const existing = await getArresteeById(id);

  if (!existing) {
    throw ApiError.notFound("Arrestee not found");
  }

  let uploadedPublicId: string | null = null;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      ARRESTEE_UPLOAD_FOLDER,
    );
    uploadedPublicId = uploadResult.public_id;

    req.body.profileImgUrl = uploadResult.secure_url;
    req.body.profileImgUrlPublicId = uploadResult.public_id;
  }

  const payload = {
    id,
    ...getBasePayload(req),
    profileImgUrl:
      req.body.profileImgUrl ?? existing.profileImgUrl ?? undefined,
    profileImgUrlPublicId:
      req.body.profileImgUrlPublicId ??
      existing.profileImgUrlPublicId ??
      undefined,
  };

  const parsed = arresteeUpdateInsertSchema.safeParse(payload);

  if (!parsed.success) {
    if (uploadedPublicId) {
      await deleteFromCloudinary(uploadedPublicId);
    }
    throw ApiError.badRequest("Invalid arrestee data", parsed.error.issues);
  }

  const result = await updateArrestee(parsed.data);

  if (
    uploadedPublicId &&
    existing.profileImgUrlPublicId &&
    existing.profileImgUrlPublicId !== uploadedPublicId
  ) {
    try {
      await deleteFromCloudinary(existing.profileImgUrlPublicId);
    } catch {
      // Keep update successful even if cleanup fails.
    }
  }

  return apiResponse.success(res, result, { message: "Arrestee updated" });
});

export const deleteArresteeController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const existing = await getArresteeById(id);

  if (!existing) {
    throw ApiError.notFound("Arrestee not found");
  }

  await deleteArrestee(id);

  if (existing.profileImgUrlPublicId) {
    try {
      await deleteFromCloudinary(existing.profileImgUrlPublicId);
    } catch {
      // Keep delete successful even if media cleanup fails.
    }
  }

  return apiResponse.noContent(res);
});

export const addLikeController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const result = await addLike(id);

  if (!result) {
    throw ApiError.notFound("Arrestee not found");
  }

  return apiResponse.success(res, result, { message: "Like added" });
});

export const removeLikeController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const result = await removeLike(id);

  if (!result) {
    throw ApiError.notFound("Arrestee not found");
  }

  return apiResponse.success(res, result, { message: "Like removed" });
});

export const addDislikeController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const result = await addDislike(id);

  if (!result) {
    throw ApiError.notFound("Arrestee not found");
  }

  return apiResponse.success(res, result, { message: "Dislike added" });
});

export const removeDislikeController = asyncHandler(async (req, res) => {
  const id = parseIdFromParams(req);
  const result = await removeDislike(id);

  if (!result) {
    throw ApiError.notFound("Arrestee not found");
  }

  return apiResponse.success(res, result, { message: "Dislike removed" });
});
