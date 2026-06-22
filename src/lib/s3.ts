import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function getPresignedUrl(s3Key: string): Promise<string> {
  if (!s3Key) return '';
  
  // If it's already a full HTTP/HTTPS URL, return it directly
  if (s3Key.startsWith('http://') || s3Key.startsWith('https://')) {
    return s3Key;
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'linengrass-voiceai-prod';
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  // Generates presigned URL with 60s expiration
  return await getSignedUrl(s3Client, command, { expiresIn: 60 });
}
