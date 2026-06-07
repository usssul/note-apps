import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByUsername(username: string): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { username } });
    } catch (error) {
      console.error('Error finding user by username:', error);
      return undefined;
    }
  }

  async findOneById(id: number): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error finding user by id:', error);
      return undefined;
    }
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    // 直接返回明文密码，不进行哈希处理
    return password;
  }

  comparePassword(password: string, storedPassword: string): boolean {
    // 直接明文对比
    return password === storedPassword;
  }
}