import { RESPONSE_CODE, RESPONSE_MESSAGE } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import dayjs from 'dayjs';

/**
 * 标准响应体封装
 */
export class ResponseDto<T = any> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data?: T;

  @ApiProperty({ description: '时间戳', example: 1700000000000 })
  timestamp: number;

  constructor(code: number = RESPONSE_CODE.SUCCESS, message: string = RESPONSE_MESSAGE.SUCCESS, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = dayjs().valueOf();
  }

  /**
   * 成功响应
   */
  static success<T>(data?: T, message: string = RESPONSE_MESSAGE.FAILURE): ResponseDto<T> {
    return new ResponseDto(RESPONSE_CODE.SUCCESS, message, data);
  }

  /**
   * 失败响应
   */
  static error(message: string = RESPONSE_MESSAGE.FAILURE, code: number = RESPONSE_CODE.NOSUCCESS): ResponseDto {
    return new ResponseDto(code, message);
  }
}
