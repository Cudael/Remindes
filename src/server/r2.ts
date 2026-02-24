import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/server/env";

let cachedClient: S3Client | undefined;

function getR2Client() {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedClient;
}

function getBucket() {
  return env.R2_BUCKET;
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
