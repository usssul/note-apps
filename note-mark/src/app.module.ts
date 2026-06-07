import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { My903Module } from './my903/my903.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { XhsModule } from './xhs/xhs.module';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { minioConfig } from './config/minio.config';
import { MinioModule as NestMinioModule } from '@usssul/nest-minio';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'local'}`, 
        '.env'
      ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    NestMinioModule.forRootAsync({
      useFactory: minioConfig,
      inject: [ConfigService],
    }),
    CommonModule,
    TasksModule,
    My903Module,
    XhsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
