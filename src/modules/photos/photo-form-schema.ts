import { z } from "zod";

export const acceptedPhotoMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const maxPhotoUploadSizeInBytes = 10 * 1024 * 1024;

export const photoUploadSchema = z.object({});

export type PhotoUploadValues = z.infer<typeof photoUploadSchema>;
