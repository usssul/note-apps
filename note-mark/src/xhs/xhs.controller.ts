import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { XhsService } from './xhs.service';
import { CreateXhsDTO } from './dto/create-xhs.dto';
import { ResponseDto } from '@/common/dto/response.dto';

@ApiTags('小红书笔记')
@Controller('xhs')
export class XhsController {
  constructor(private readonly xhsService: XhsService) {}

  /**
   * 创建笔记
   * @param createXhsDTO
   * @returns
   */
  @Post('create')
  @ApiOperation({ summary: '创建笔记', description: '创建新笔记并自动下载媒体资源到 MinIO' })
  @ApiBody({ type: CreateXhsDTO })
  async create(@Body() createXhsDTO: CreateXhsDTO) {
    try {
      const result = await this.xhsService.create(createXhsDTO);
      return ResponseDto.success(result._id, '笔记创建成功');
    } catch (error) {
      return ResponseDto.error(error.message || '创建笔记失败');
    }
  }

  /**
   * 批量创建笔记
   * @param CreateXhsDTO[]
   * @returns
   */
  @Post('batch')
  @ApiOperation({ summary: '批量创建笔记', description: '批量创建笔记并处理媒体资源' })
  async batchCreate(@Body() notes: CreateXhsDTO[]) {
    try {
      const result = await this.xhsService.batchCreate(notes);
      return {
        success: true,
        message: `批量创建完成: ${result.success} 成功, ${result.failed} 失败`,
        data: result,
      };
    } catch (error) {
      console.error('[XhsController] batchCreate 错误:', error);
      throw new HttpException(
        {
          success: false,
          message: `批量创建失败: ${error.message}`,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  // /**
  //  * 检查笔记是否存在
  //  * @param noteId
  //  * @returns
  //  */
  // @Get('exists/:noteId')
  // @ApiOperation({ summary: '检查笔记是否存在' })
  // @ApiParam({ name: 'noteId', description: '笔记 ID' })
  // async exists(@Param('noteId') noteId: string) {
  //   try {
  //     const exists = await this.xhsService.exists(noteId);
  //     return {
  //       success: true,
  //       data: { noteId, exists },
  //     };
  //   } catch (error) {
  //     console.error('[XhsController] exists 错误:', error);
  //     throw new HttpException(
  //       {
  //         success: false,
  //         message: `检查笔记存在失败: ${error.message}`,
  //       },
  //       error.status || HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  /**
   * 获取单个笔记
   * @param noteId
   * @returns
   */
  @Get('note/:noteId')
  @ApiOperation({ summary: '获取单个笔记', description: '根据 noteId 获取笔记详情' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  async findOne(@Param('noteId') noteId: string) {
    return this.xhsService.findOne(noteId);
  }


  // @Patch('note/:noteId')
  // @ApiOperation({ summary: '更新笔记', description: '更新指定笔记的内容' })
  // @ApiParam({ name: 'noteId', description: '笔记 ID' })
  // async update(
  //   @Param('noteId') noteId: string,
  //   @Body() updateData: Partial<CreateXhsDTO>
  // ) {
  //   try {
  //     const result = await this.xhsService.update(noteId, updateData);
  //     return {
  //       success: true,
  //       message: '笔记更新成功',
  //       data: result,
  //     };
  //   } catch (error) {
  //     console.error('[XhsController] update 错误:', error);
  //     throw new HttpException(
  //       {
  //         success: false,
  //         message: `更新笔记失败: ${error.message}`,
  //       },
  //       error.status || HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  /**
   * 切换收藏状态
   * @param noteId
   * @returns
   */
  @Patch('note/:noteId/favorite')
  @ApiOperation({ summary: '切换收藏状态', description: '切换指定笔记的收藏状态' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  async toggleFavorite(@Param('noteId') noteId: string) {
    try {
      const result = await this.xhsService.toggleFavorite(noteId);
      return ResponseDto.success(
        { isFavorited: result.isFavorited, favoritedAt: result.favoritedAt },
        result.isFavorited ? '收藏成功' : '已取消收藏',
      );
    } catch (error) {
      return ResponseDto.error(error.message || '操作失败');
    }
  }

  /**
   * 删除笔记
   * @param noteId
   * @returns
   */
  @Delete('note/:noteId')
  @ApiOperation({ summary: '删除笔记', description: '删除指定的笔记' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  async remove(@Param('noteId') noteId: string) {
    try {
      const result = await this.xhsService.remove(noteId);
      return {
        success: true,
        message: '笔记删除成功',
        data: result,
      };
    } catch (error) {
      console.error('[XhsController] remove 错误:', error);
      throw new HttpException(
        {
          success: false,
          message: `删除笔记失败: ${error.message}`,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 检查笔记是否存在
   * @param noteId
   * @returns
   */
  @Get('check/:noteId')
  @ApiOperation({ summary: '检查笔记是否存在', description: '根据 noteId 检查笔记是否存在' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  async checkNoteExists(@Param('noteId') noteId: string) {
    try {
      const exists = await this.xhsService.exists(noteId);
      return {
           noteId,
          exists
      };
    } catch (error) {
      console.error('[XhsController] checkNoteExists 错误:', error);
      throw new HttpException(
        {
          success: false,
          message: `检查笔记存在失败: ${error.message}`,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  /**
   * 获取统计信息
   * @returns
   */
  @Get('statistics')
  @ApiOperation({ summary: '获取统计信息', description: '获取小红书笔记总数统计' })
  async getStatistics() {
    try {
      const statistics = await this.xhsService.getStatistics();
      return ResponseDto.success(statistics, '获取统计信息成功');
    } catch (error) {
      return ResponseDto.error(error.message || '获取统计信息失败');
    }
  }

  /**
   * 获取仪表盘统计数据
   * @returns
   */
  @Get('statistics/dashboard')
  @ApiOperation({ summary: '获取仪表盘统计', description: '获取多维度统计数据：类型分布、月度趋势、Top用户、互动总和、Top笔记' })
  async getDashboardStats() {
    try {
      const stats = await this.xhsService.getDashboardStats();
      return ResponseDto.success(stats, '获取仪表盘统计成功');
    } catch (error) {
      return ResponseDto.error(error.message || '获取仪表盘统计失败');
    }
  }




    /**
   * 获取笔记列表
   * @param page
   * @param limit
   * @returns
   */
  @Get('list')
  @ApiOperation({ summary: '获取笔记列表', description: '分页获取所有笔记' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码，默认 1' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量，默认 20' })
  @ApiQuery({ name: 'keyword', required: false, type: String, description: '模糊搜索（同时匹配昵称和标题）' })
  @ApiQuery({ name: 'nickname', required: false, type: String, description: '按用户昵称搜索' })
  @ApiQuery({ name: 'title', required: false, type: String, description: '按笔记标题搜索' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: '按用户 ID 精确筛选' })
  @ApiQuery({ name: 'type', required: false, type: String, description: '按笔记类型筛选：normal（图文）| video（视频）' })
  @ApiQuery({ name: 'isFavorited', required: false, type: Boolean, description: '按收藏状态筛选：true 只显示收藏' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('nickname') nickname?: string,
    @Query('title') title?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('isFavorited') isFavorited?: string,
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const favFilter = isFavorited !== undefined ? isFavorited === 'true' : undefined;
      const hasFilter = keyword || nickname || title || userId || type || favFilter !== undefined;
      const search = hasFilter ? { keyword, nickname, title, userId, type, isFavorited: favFilter } : undefined;
      const result = await this.xhsService.findAll(pageNum, limitNum, search);
      return ResponseDto.success(result, '获取笔记列表成功');
    } catch (error) {
      console.error('[XhsController] findAll 错误:', error);
      throw new HttpException(
        {
          success: false,
          message: `获取笔记列表失败: ${error.message}`,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
