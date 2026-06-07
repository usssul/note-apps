import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponseDto {
  @ApiProperty({ description: '文件名', example: 'avatars/1234567890-avatar.jpg' })
  fileName: string;

  @ApiProperty({ description: '预签名URL', example: 'http://localhost:9000/my903/avatars/...' })
  presignedUrl: string;
}

export class FileListItemDto {
  @ApiProperty({ description: '文件名' })
  name: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size: number;

  @ApiProperty({ description: '最后修改时间' })
  lastModified: Date;

  @ApiProperty({ description: 'ETag' })
  etag: string;
}

export class DeleteFileResponseDto {
  @ApiProperty({ description: '响应消息', example: 'File deleted successfully' })
  message: string;
}
