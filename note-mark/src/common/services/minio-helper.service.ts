import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { MinioService } from '@usssul/nest-minio';
import { minioConfig } from '../../config/minio.config';
import axios from '../../config/axios.config';

@Injectable()
export class MinioHelperService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private minioBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {
    const options = minioConfig(configService);
    this.minioClient = new Minio.Client({
      endPoint: options.endPoint,
      port: options.port,
      useSSL: options.useSSL,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    });

    this.bucketName = options.bucketName;
    this.minioBaseUrl = `${options.useSSL ? 'https' : 'http'}://${options.endPoint}:${options.port}`;

    this.initAllBuckets();
  }

  private async initAllBuckets() {
    const buckets = [
      this.configService.get<string>('MINIO_BUCKET_NAME', 'xhs'),
      this.configService.get<string>('MINIO_BUCKET_AVATAR', 'avatar'),
      this.configService.get<string>('MINIO_BUCKET_MY903_VIDEO', 'xhs-video')
    ];
    
    for (const bucketName of buckets) {
      await this.ensureBucketExists(bucketName);
    }
  }

  private async ensureBucketExists(bucketName: string) {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`[MinIO] 创建存储桶: ${bucketName}`);
      }
    } catch (error) {
      console.error(`[MinIO] 初始化存储桶失败: ${bucketName}`, error.message);
    }
  }

  getMinioUrl(bucketName: string, objectName: string): string {
    return `${this.minioBaseUrl}/${bucketName}/${objectName}`;
  }

  async uploadFile(file: Express.Multer.File, objectName: string): Promise<string> {
    await this.minioClient.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );
    return this.minioService.getPresignedUrl(objectName);
  }

  async uploadByUrl(url: string): Promise<string> {
    console.log(`[MinIO] 开始上传: ${url}`);
    
    const md5Hash = createHash('md5');
    let contentLength = 0;

    try {
      try {
        const bucketExists = await this.minioClient.bucketExists(this.bucketName);
        console.log(`[MinIO] Bucket "${this.bucketName}" 存在: ${bucketExists}`);
        if (!bucketExists) {
          console.log(`[MinIO] 创建 Bucket: ${this.bucketName}`);
          await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        }
      } catch (minioError) {
        console.error('[MinIO] 连接错误:', {
          message: minioError.message,
          code: minioError.code,
        });
        throw new Error(`MinIO 连接失败: ${minioError.message}`);
      }

      console.log(`[MinIO] 下载源文件: ${url}`);
      const { data: sourceStream } = await axios.get(url, {
        responseType: 'stream',
        headers: { 'User-Agent': 'MinIO Uploader' },
        timeout: 15000
      });

      const transformStream = new Readable({
        read() { }
      });

      sourceStream
        .on('data', (chunk: Buffer) => {
          md5Hash.update(chunk);
          contentLength += chunk.length;
          transformStream.push(chunk);
        })
        .on('end', () => {
          transformStream.push(null);
          console.log(`[MinIO] 文件下载完成, 大小: ${contentLength} bytes`);
        })
        .on('error', (error) => {
          console.error('[MinIO] 源流错误:', error);
          transformStream.destroy(error);
        });

      await new Promise((resolve, reject) => {
        sourceStream.on('end', resolve);
        sourceStream.on('error', reject);
      });

      const fileExt = this.getFileExtension(url);
      const md5Hex = md5Hash.digest('hex');
      const objectName = fileExt ? `${md5Hex}.${fileExt}` : md5Hex;
      console.log(`[MinIO] 生成文件名: ${objectName}`);

      console.log(`[MinIO] 开始上传到 MinIO...`);
      await pipeline(
        transformStream,
        async (source: Readable) => {
          await this.minioClient.putObject(
            this.bucketName,
            objectName,
            source,
            contentLength
          );
        }
      );

      console.log(`[MinIO] 上传成功: /${this.bucketName}/${objectName}`);
      
      return `/${this.bucketName}/${objectName}`;

    } catch (error) {
      console.error('[MinIO] uploadByUrl 错误:', {
        url,
        message: error.message,
        code: error.code,
      });
      
      if (error.response?.status === 404) {
        throw new NotFoundException(`源文件不存在: ${url}`);
      } else if (error.code === 'ENOTFOUND') {
        throw new NotFoundException(`无法连接到源服务器: ${url}`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new Error(`请求超时: ${url}`);
      } else {
        throw new Error(`上传失败: ${error.message || '未知错误'}`);
      }
    }
  }

  async uploadByUrlToBucket(url: string, bucket: string): Promise<string> {
    if (!url || url.trim() === '') {
      return '';
    }
  
    console.log(`[MinIO] 开始上传到 ${bucket}: ${url}`);
  
    const md5Hash = createHash('md5');
    let contentLength = 0;
  
    try {
      await this.ensureBucketExists(bucket);
  
      const { data: sourceStream } = await axios.get(url, {
        responseType: 'stream',
        headers: { 'User-Agent': 'MinIO Uploader' },
        timeout: 60000
      });
  
      const chunks: Buffer[] = [];
  
      await new Promise<void>((resolve, reject) => {
        sourceStream
          .on('data', (chunk: Buffer) => {
            md5Hash.update(chunk);
            contentLength += chunk.length;
            chunks.push(chunk);
          })
          .on('end', () => {
            console.log(`[MinIO] 文件下载完成, 大小: ${contentLength} bytes`);
            resolve();
          })
          .on('error', reject);
      });
  
      let fileExt = this.getFileExtension(url);
      if (!fileExt && sourceStream.headers?.['content-type']) {
        const contentType = sourceStream.headers['content-type'];
        if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
          fileExt = 'jpg';
        } else if (contentType.includes('image/png')) {
          fileExt = 'png';
        } else if (contentType.includes('image/webp')) {
          fileExt = 'webp';
        } else if (contentType.includes('image/gif')) {
          fileExt = 'gif';
        } else if (contentType.includes('video/mp4')) {
          fileExt = 'mp4';
        } else if (contentType.includes('video/quicktime')) {
          fileExt = 'mov';
        } else if (contentType.includes('video/avi')) {
          fileExt = 'avi';
        } else if (contentType.includes('video/x-ms-wmv')) {
          fileExt = 'wmv';
        } else if (contentType.includes('video/webm')) {
          fileExt = 'webm';
        }
      }
            
      const md5Hex = md5Hash.digest('hex');
      const objectName = fileExt ? `${md5Hex}.${fileExt}` : md5Hex;
      
      const buffer = Buffer.concat(chunks);
      await this.minioClient.putObject(bucket, objectName, buffer, contentLength);
  
      console.log(`[MinIO] 上传成功: /${bucket}/${objectName}`);
      return `/${bucket}/${objectName}`;
  
    } catch (error) {
      console.error(`[MinIO] uploadByUrlToBucket 错误:`, {
        url,
        bucket,
        message: error.message,
        code: error.code
      });
      return '';
    }
  }
  
  selectBestVideoStream(stream: {
    h264?: Array<{ masterUrl: string }>;
    h265?: Array<{ masterUrl: string }>;
    h266?: Array<{ masterUrl: string }>;
    av1?: Array<{ masterUrl: string }>;
  }): string | null {
    if (stream.h266 && stream.h266.length > 0 && stream.h266[0].masterUrl) {
      return stream.h266[0].masterUrl;
    }
    if (stream.h265 && stream.h265.length > 0 && stream.h265[0].masterUrl) {
      return stream.h265[0].masterUrl;
    }
    if (stream.h264 && stream.h264.length > 0 && stream.h264[0].masterUrl) {
      return stream.h264[0].masterUrl;
    }
    if (stream.av1 && stream.av1.length > 0 && stream.av1[0].masterUrl) {
      return stream.av1[0].masterUrl;
    }
    return null;
  }
  
  private getFileExtension(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const lastDotIndex = path.lastIndexOf('.');
      
      if (lastDotIndex > -1 && lastDotIndex < path.length - 1) {
        const ext = path.slice(lastDotIndex + 1).split('?')[0].toLowerCase();
        
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi', 'wmv', 'webm'];
        if (validExtensions.includes(ext)) {
          return ext;
        }
      }
      
      const searchParams = parsedUrl.searchParams;
      for (const [key, value] of searchParams.entries()) {
        if (key.toLowerCase().includes('format') || key.toLowerCase().includes('ext')) {
          const ext = value.toLowerCase();
          const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi', 'wmv', 'webm'];
          if (validExtensions.includes(ext)) {
            return ext;
          }
        }
      }
      
      return '';
    } catch {
      return '';
    }
  }
}
