import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { MINIO_OPTIONS } from './minio.constants';
import type { MinioOptions } from './minio.interface';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    @Inject(MINIO_OPTIONS) private options: MinioOptions,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: options.endPoint,
      port: options.port,
      useSSL: options.useSSL,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    });
    this.bucketName = options.bucketName;
    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created`);
      } else {
        this.logger.log(`Bucket ${this.bucketName} already exists`);
      }
    } catch (error) {
      this.logger.error('Error ensuring bucket exists:', error);
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string) {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        { contentType },
      );
      return fileName;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFile(fileName: string) {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, fileName);
      return stream;
    } catch (error) {
      this.logger.error('Error getting file:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string) {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(prefix?: string) {
    try {
      const files: Minio.BucketItem[] = [];
      const stream = this.minioClient.listObjectsV2(this.bucketName, prefix, true);
      for await (const obj of stream) {
        files.push(obj);
      }
      return files;
    } catch (error) {
      this.logger.error('Error listing files:', error);
      throw error;
    }
  }

  getPresignedUrl(fileName: string, expiry: number = 7 * 24 * 60 * 60) {
    try {
      return this.minioClient.presignedUrl('GET', this.bucketName, fileName, expiry);
    } catch (error) {
      this.logger.error('Error generating presigned URL:', error);
      throw error;
    }
  }
}
