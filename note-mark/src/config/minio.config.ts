import { ConfigService } from '@nestjs/config';
import { MinioOptions } from '@usssul/nest-minio';

export const minioConfig = (configService: ConfigService): MinioOptions => {
  const endPoint = configService.get<string>('MINIO_ENDPOINT');
  const port = configService.get<string>('MINIO_PORT');
  const useSSL = configService.get<string>('MINIO_USE_SSL');
  const accessKey = configService.get<string>('MINIO_ACCESS_KEY');
  const secretKey = configService.get<string>('MINIO_SECRET_KEY');
  const bucketName = configService.get<string>('MINIO_BUCKET_NAME');

  const missingVars: string[] = [];
  if (!endPoint) missingVars.push('MINIO_ENDPOINT');
  if (!port) missingVars.push('MINIO_PORT');
  if (!useSSL) missingVars.push('MINIO_USE_SSL');
  if (!accessKey) missingVars.push('MINIO_ACCESS_KEY');
  if (!secretKey) missingVars.push('MINIO_SECRET_KEY');
  if (!bucketName) missingVars.push('MINIO_BUCKET_NAME');

  if (missingVars.length > 0) {
    throw new Error(`Missing required MinIO environment variables: ${missingVars.join(', ')}`);
  }

  return {
    endPoint: endPoint!,
    port: parseInt(port!, 10),
    useSSL: useSSL === 'true',
    accessKey: accessKey!,
    secretKey: secretKey!,
    bucketName: bucketName!,
  };
};
