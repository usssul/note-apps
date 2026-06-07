import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MinioModule } from './minio';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/docs',
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
