import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseDto } from '../common/dto/response.dto';

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      return ResponseDto.success(user, '注册成功');
    } catch (error) {
      return ResponseDto.error(error.message || '注册失败', 400);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.username, loginDto.password);
      if (!user) {
        return ResponseDto.error('用户名或密码错误');
      }
      const token = await this.authService.login(user);
      return ResponseDto.success(token, '登录成功');
    } catch (error) {
      return ResponseDto.error(error.message || '登录失败', 400);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return ResponseDto.success(req.user, '获取用户信息成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get('info')
  async getInfo(@Request() req) {
    try {
      const userInfo = await this.authService.getUserInfo(req.user.sub);
      return ResponseDto.success(userInfo, '获取用户信息成功');
    } catch (error) {
      return ResponseDto.error(error.message || '获取用户信息失败', 400);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return ResponseDto.success(null, '登出成功');
  }
}