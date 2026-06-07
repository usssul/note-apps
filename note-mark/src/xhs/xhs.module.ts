import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { XhsService } from './xhs.service';
import { XhsController } from './xhs.controller';
import { Xhs, XhsSchema } from './entities/xhs.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Xhs.name, schema: XhsSchema },
    ]),
    CommonModule,
  ],
  controllers: [XhsController],
  providers: [XhsService],
  exports: [XhsService],
})
export class XhsModule {}
