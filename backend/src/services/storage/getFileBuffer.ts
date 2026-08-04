import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from './s3Client';

export type FileContent = {
  buffer: Buffer;
  mimeType: string;
};

export async function getFileBuffer(key: string): Promise<FileContent> {
  const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
  const bytes = await response.Body!.transformToByteArray();

  return {
    buffer: Buffer.from(bytes),
    mimeType: response.ContentType ?? 'application/octet-stream',
  };
}
