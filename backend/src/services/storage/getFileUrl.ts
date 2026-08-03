import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from './s3Client';

const SIGNED_URL_TTL_SECONDS = 300;

export function getSignedFileUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}
