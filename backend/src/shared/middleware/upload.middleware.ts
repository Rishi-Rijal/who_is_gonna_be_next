import multer from "multer";
import type { FileFilterCallback } from "multer";
import type { Request } from "express";
import { ApiError } from "../utils/apiError";

const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 20 MB

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new ApiError(400, "Only jpeg, png, webp images are allowed"));
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
});
