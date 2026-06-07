import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { MinioService } from './minio/minio.service';
import {
  UploadFileResponseDto,
  FileListItemDto,
  DeleteFileResponseDto,
} from './dto/file.dto';

@ApiTags('files')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件', description: '上传文件到MinIO存储' })
  @ApiResponse({
    status: 201,
    description: '文件上传成功',
    type: UploadFileResponseDto,
  })
  @ApiResponse({ status: 400, description: '文件上传失败' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = `avatars/${Date.now()}-${file.originalname}`;
    await this.minioService.uploadFile(fileName, file.buffer, file.mimetype);
    const presignedUrl = this.minioService.getPresignedUrl(fileName);
    return { fileName, presignedUrl };
  }

  @Get('files')
  @ApiOperation({ summary: '列出文件', description: '列出指定前缀的所有文件' })
  @ApiQuery({
    name: 'prefix',
    required: false,
    description: '文件路径前缀',
    example: 'avatars/',
  })
  @ApiResponse({
    status: 200,
    description: '文件列表',
    type: [FileListItemDto],
  })
  async listFiles(@Query('prefix') prefix?: string) {
    return await this.minioService.listFiles(prefix);
  }

  @Delete('files/:fileName')
  @ApiOperation({ summary: '删除文件', description: '从MinIO删除指定文件' })
  @ApiParam({ name: 'fileName', description: '文件名', example: 'avatar.jpg' })
  @ApiResponse({
    status: 200,
    description: '文件删除成功',
    type: DeleteFileResponseDto,
  })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async deleteFile(@Param('fileName') fileName: string) {
    await this.minioService.deleteFile(`avatars/${fileName}`);
    return { message: 'File deleted successfully' };
  }
}
