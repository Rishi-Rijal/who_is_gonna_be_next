import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import { ApiError } from "./apiError";
import { env } from "../../config/env";

const configureCloudinary = () => {
  if (env.CLOUDINARY_API_URL) {
    const parsed = new URL(env.CLOUDINARY_API_URL);

    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password),
      secure: true,
    });

    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

configureCloudinary();

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
