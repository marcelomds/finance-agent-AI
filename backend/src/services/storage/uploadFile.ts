import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { s3Client, BUCKET_NAME } from './s3Client';

export type UploadFileInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  organizationId: string;
  folder?: string;
};

export async function uploadToS3(input: UploadFileInput): Promise<string> {
  const safeName = input.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${input.folder ?? 'uploads'}/${input.organizationId}/${randomUUID()}-${safeName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: input.buffer,
      ContentType: input.mimeType,
    }),
  );

  return key;
}
