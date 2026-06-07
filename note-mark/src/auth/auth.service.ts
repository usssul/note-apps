import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // 从数据库查找用户
    const user = await this.authRepository.findOneByUsername(username);
    
    if (user && this.authRepository.comparePassword(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, email: user.email };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async hashPassword(password: string): Promise<string> {
    return this.authRepository.hashPassword(password);
  }

  async register(registerDto: { username: string; email?: string; password: string; firstName?: string; lastName?: string }) {
    const existingUser = await this.authRepository.findOneByUsername(registerDto.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 直接保存明文密码，不进行哈希处理
    const user = await this.authRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });
    
    // 不返回密码
    const { password, ...result } = user;
    return result;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserInfo(userId: number): Promise<any> {
    const user = await this.authRepository.findOneById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    // 不返回密码
    const { password, ...result } = user;
    return result;
  }
}