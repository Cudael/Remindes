import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_TYPES)[number];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedType(type: string): type is AllowedMimeType {
  return (ALLOWED_TYPES as readonly string[]).includes(type);
}

export function isAllowedSize(size: number): boolean {
  return size > 0 && size <= MAX_SIZE_BYTES;
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function getBucket() {
  return process.env.R2_BUCKET!;
}

/**
 * Generate a pre-signed PUT URL so the client can upload directly to R2.
 */
export async function createPresignedUploadUrl(
  storageKey: string,
  mimeType: string,
  size: number,
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: storageKey,
    ContentType: mimeType,
    ContentLength: size,
  });

  return getSignedUrl(client, command, { expiresIn: 600 }); // 10 min
}

/**
 * Generate a pre-signed GET URL for downloading a file from R2.
 */
export async function createPresignedDownloadUrl(
  storageKey: string,
): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: storageKey,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour
}

/**
 * Delete an object from R2.
 */
export async function deleteObject(storageKey: string): Promise<void> {
  const client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: storageKey,
  });

  await client.send(command);
}
