import { Module } from '@nestjs/common';
import { MinioHelperService } from './services/minio-helper.service';

@Module({
  providers: [MinioHelperService],
  exports: [MinioHelperService],
})
export class CommonModule {}
