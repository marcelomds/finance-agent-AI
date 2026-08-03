import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const BUCKET_NAME = process.env.AWS_BUCKET as string;
