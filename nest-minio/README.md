# Nest.js MinIO 包

一个用于 Nest.js 应用程序的 MinIO 客户端包，提供完整的增删查改功能。

## 特性

- 自动创建和管理存储桶
- 文件上传、下载、删除和列表功能
- 预签名 URL 生成
- 支持环境变量配置
- 生产环境友好的设计

## 本地导入

### 方式一：使用相对路径安装

在你的项目根目录执行：

```bash
npm install ../nest-minio
```

或者使用 yarn：

```bash
yarn add file:../nest-minio
```

### 方式二：使用 npm link

在 nest-minio 项目目录执行：

```bash
npm link
```

然后在你的项目目录执行：

```bash
npm link nest-minio
```

### 方式三：在 package.json 中配置

在你的项目 `package.json` 中添加依赖：

```json
{
  "dependencies": {
    "nest-minio": "file:../nest-minio"
  }
}
```

然后执行：

```bash
npm install
```

## 快速开始

### 方式一：直接配置（推荐）

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MinioModule } from 'nest-minio';

@Module({
  imports: [
    MinioModule.forRoot({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: '12345678',
      bucketName: 'my903',
    }),
  ],
})
export class AppModule {}
```

### 方式二：异步配置（配合 ConfigModule）

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from 'nest-minio';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MinioModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_ENDPOINT') || 'localhost',
        port: parseInt(configService.get('MINIO_PORT') || '9000', 10),
        useSSL: configService.get('MINIO_USE_SSL') === 'true',
        accessKey: configService.get('MINIO_ACCESS_KEY') || 'admin',
        secretKey: configService.get('MINIO_SECRET_KEY') || '12345678',
        bucketName: configService.get('MINIO_BUCKET_NAME') || 'my903',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

环境变量配置（可选）：

```env
# .env 文件
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=12345678
MINIO_BUCKET_NAME=my903
```

### 在服务中使用

```typescript
// avatar.service.ts
import { Injectable } from '@nestjs/common';
import { MinioService } from 'nest-minio';

@Injectable()
export class AvatarService {
  constructor(private minioService: MinioService) {}

  // 上传用户头像
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const fileName = `avatars/${userId}/${Date.now()}-${file.originalname}`;
    await this.minioService.uploadFile(fileName, file.buffer, file.mimetype);
    return this.minioService.getPresignedUrl(fileName);
  }

  // 获取用户头像
  async getAvatar(fileName: string) {
    return await this.minioService.getFile(fileName);
  }

  // 删除用户头像
  async deleteAvatar(fileName: string) {
    return await this.minioService.deleteFile(fileName);
  }

  // 列出用户所有头像
  async listAvatars(userId: string) {
    return await this.minioService.listFiles(`avatars/${userId}/`);
  }
}
```

### 创建控制器

```typescript
// avatar.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';

@Controller('avatars')
export class AvatarController {
  constructor(private avatarService: AvatarService) {}

  @Post(':userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.avatarService.uploadAvatar(userId, file);
  }

  @Get('list/:userId')
  async listAvatars(@Param('userId') userId: string) {
    return await this.avatarService.listAvatars(userId);
  }

  @Delete(':fileName')
  async deleteAvatar(@Param('fileName') fileName: string) {
    return await this.avatarService.deleteAvatar(fileName);
  }
}
```

## API 文档

### MinioService

#### uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise&lt;string&gt;

上传文件到 MinIO。

**参数：**
- `fileName`: 文件在 MinIO 中的路径和名称
- `fileBuffer`: 文件的 Buffer 数据
- `contentType`: 文件的 MIME 类型

**返回：** 上传的文件名

#### getFile(fileName: string): Promise&lt;Readable&gt;

从 MinIO 获取文件流。

**参数：**
- `fileName`: 文件在 MinIO 中的路径和名称

**返回：** 文件流

#### deleteFile(fileName: string): Promise&lt;boolean&gt;

从 MinIO 删除文件。

**参数：**
- `fileName`: 文件在 MinIO 中的路径和名称

**返回：** 是否成功删除

#### listFiles(prefix?: string): Promise&lt;Minio.BucketItem[]&gt;

列出指定前缀的文件。

**参数：**
- `prefix`: 可选，文件路径前缀

**返回：** 文件列表

#### getPresignedUrl(fileName: string, expiry?: number): Promise&lt;string&gt;

生成预签名 URL，用于临时访问文件。

**参数：**
- `fileName`: 文件在 MinIO 中的路径和名称
- `expiry`: 可选，URL 有效期（秒），默认 7 天

**返回：** 预签名 URL

## API 文档

项目集成了 Swagger 和 ReDoc，提供完整的 API 文档。

### 启动服务

```bash
npm run start:dev
```

### 访问文档

启动服务后，可以通过以下地址访问 API 文档：

- **Swagger UI**: http://localhost:3000/api
- **ReDoc**: http://localhost:3000/docs/redoc.html
- **OpenAPI JSON**: http://localhost:3000/api-json

### API 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /upload | 上传文件 |
| GET | /files | 列出文件 |
| DELETE | /files/:fileName | 删除文件 |

## 配置选项

### MinioOptions 接口

```typescript
interface MinioOptions {
  endPoint: string;    // MinIO 服务器地址
  port: number;        // MinIO 端口
  useSSL: boolean;     // 是否使用 SSL
  accessKey: string;   // 访问密钥
  secretKey: string;   // 密钥
  bucketName: string;  // 存储桶名称
}
```

### 配置示例

| 参数 | 说明 | 示例值 |
|------|------|--------|
| endPoint | MinIO 服务器地址 | localhost |
| port | MinIO 端口 | 9000 |
| useSSL | 是否使用 SSL | false |
| accessKey | 访问密钥 | admin |
| secretKey | 密钥 | 12345678 |
| bucketName | 存储桶名称 | my903 |

## 生产环境配置

在生产环境中，建议：

1. **使用 forRootAsync**：配合 ConfigModule 从环境变量读取配置
2. **启用 SSL**：设置 `useSSL: true`
3. **使用强密码**：使用复杂的 `accessKey` 和 `secretKey`
4. **配置访问策略**：限制存储桶的访问权限
5. **监控日志**：定期检查 MinIO 服务的运行日志

生产环境配置示例：

```typescript
MinioModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    endPoint: configService.get('MINIO_ENDPOINT'),
    port: parseInt(configService.get('MINIO_PORT'), 10),
    useSSL: configService.get('MINIO_USE_SSL') === 'true',
    accessKey: configService.get('MINIO_ACCESS_KEY'),
    secretKey: configService.get('MINIO_SECRET_KEY'),
    bucketName: configService.get('MINIO_BUCKET_NAME'),
  }),
  inject: [ConfigService],
})
```

## 生产环境打包

### 构建生产版本

```bash
npm run build
```

构建完成后，会在 `dist/minio` 目录生成以下文件：

```
dist/minio/
├── index.js           # 入口文件
├── index.d.ts         # TypeScript 类型定义
├── minio.module.js    # 模块文件
├── minio.service.js   # 服务文件
└── ...
```

### 发布到 npm

1. 登录 npm：

```bash
npm login
```

2. 发布包：

```bash
npm publish
```

发布前会自动执行 `npm run build` 构建代码。

### 本地打包（不发布）

如果只想打包而不发布到 npm：

```bash
npm pack
```

这会生成一个 `nest-minio-1.0.0.tgz` 文件，可以分享给其他开发者安装：

```bash
npm install nest-minio-1.0.0.tgz
```

### 发布到私有 npm 仓库

如果有私有 npm 仓库（如 Verdaccio、Nexus 等）：

1. 配置 npm 仓库地址：

```bash
npm config set registry http://your-private-registry.com
```

2. 发布：

```bash
npm publish
```

### 验证打包内容

查看将要发布的文件：

```bash
npm pack --dry-run
```

### 版本管理

更新版本号：

```bash
# 更新补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 更新次版本 (1.0.0 -> 1.1.0)
npm version minor

# 更新主版本 (1.0.0 -> 2.0.0)
npm version major
```

## 启动 MinIO 服务器

使用 Docker 快速启动 MinIO：

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=12345678 \
  minio/minio server /data --console-address ":9001"
```

## 许可证

MIT
