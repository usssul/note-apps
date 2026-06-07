import { Controller, Inject, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TasksService } from './tasks.service';
import { My903Service } from 'src/my903/my903.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Inject(My903Service)
  private readonly my903Service: My903Service;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Get('fetchNew')
  async fetchNew() {
    const columnsStr = this.configService.get<string>('MY903_FETCH_COLUMNS', '9');
    const limit = this.configService.get<number>('MY903_FETCH_LIMIT', 10);
    const columns = columnsStr.split(',').map(c => c.trim()).filter(Boolean);

    const results: Record<string, any> = {};

    for (const columnId of columns) {
      try {
        const data = await this.my903Service.fetchNew(columnId, limit);
        results[columnId] = { success: true, count: data?.length ?? 0 };
      } catch (error) {
        console.error(`[TasksController] 栏目 ${columnId} 抓取失败:`, error.message);
        results[columnId] = { success: false, error: error.message };
      }
    }

    const hasFailures = Object.values(results).some((r: any) => !r.success);
    const hasSuccesses = Object.values(results).some((r: any) => r.success);

    if (hasFailures && hasSuccesses) {
      return { message: '部分栏目抓取失败', results };
    }
    if (hasFailures && !hasSuccesses) {
      return { message: '所有栏目抓取失败', results };
    }

    return { message: '所有栏目抓取成功', results };
  }
}
