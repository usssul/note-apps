import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET', 'default_secret_key'),
  signOptions: { 
    expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
  },
});