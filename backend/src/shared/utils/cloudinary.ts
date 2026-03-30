import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import { ApiError } from "./apiError";

export const uploadToCloudinary = (
  buffer: Buffer,
  mimetype: string,
  folder: string,
) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) reject(new ApiError(500, "Upload failed"));
        else resolve(result!);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = (publicId: string) => {
  return new Promise<void>((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "auto" },
      (error) => {
        if (error) reject(new ApiError(500, "Deletion failed"));
        else resolve();
      },
    );
  });
};
