import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { My903Service } from 'src/my903/my903.service';

@Injectable()
export class TasksService {

    @Inject(My903Service)
    private readonly my903Service: My903Service;

    @Inject(ConfigService)
    private readonly configService: ConfigService;

    private readonly logger = new Logger(TasksService.name)

    /**
     * 从环境变量读取要抓取的栏目列表，逐个抓取
     * 每个栏目独立错误处理，一个失败不影响其他
     */
    private async fetchColumns(): Promise<void> {
      const columnsStr = this.configService.get<string>('MY903_FETCH_COLUMNS', '9');
      const limit = this.configService.get<number>('MY903_FETCH_LIMIT', 10);
      const columns = columnsStr.split(',').map(c => c.trim()).filter(Boolean);

      this.logger.log(`开始抓取栏目: [${columns.join(', ')}], limit=${limit}`);

      for (const columnId of columns) {
        try {
          this.logger.log(`正在抓取栏目 ${columnId}...`);
          const result = await this.my903Service.fetchNew(columnId, limit);
          this.logger.log(`栏目 ${columnId} 抓取完成，获得 ${result?.length ?? 0} 条`);
        } catch (error) {
          this.logger.error(`栏目 ${columnId} 抓取失败: ${error.message}`, error.stack);
        }
      }

      this.logger.log('所有栏目抓取任务完成');
    }

    // 应用启动后3秒执行首次抓取
    @Timeout(3000)
    handleTimeout() {
      this.logger.log('应用启动后3秒，开始首次抓取');
      this.fetchColumns();
    }

    // 每天早上10点定时抓取
    @Cron('0 0 10 * * *')
    handleDailyTask() {
      this.logger.log('每日定时任务触发（早上10点）');
      this.fetchColumns();
    }
}
