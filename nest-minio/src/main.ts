import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MinIO API')
    .setDescription('MinIO 文件存储服务 API 文档')
    .setVersion('1.0')
    .addTag('files', '文件操作相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI: ${await app.getUrl()}/api`);
  console.log(`ReDoc: ${await app.getUrl()}/docs/redoc.html`);
}
bootstrap();
