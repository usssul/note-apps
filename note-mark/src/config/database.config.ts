import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { User as AuthUser } from '../auth/entities/user.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', '127.0.0.1'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USER', 'root'),
  password: configService.get<string>('DB_PASSWORD', 'root'),
  database: configService.get<string>('DB_NAME', 'note-mark'),
  entities: [User, AuthUser], // 明确指定实体
  synchronize: configService.get<boolean>('DB_SYNC', false), // 生产环境中应设为 false
  autoLoadEntities: false, // 关闭自动加载，使用明确指定的实体
  logging: configService.get<boolean>('DB_LOGGING', false),
});