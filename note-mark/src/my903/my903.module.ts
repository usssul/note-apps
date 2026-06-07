import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { My903Service } from './my903.service';
import { My903Controller } from './my903.controller';
import { My903, My903Schema } from './entities/my903.entity';
import { My903SyncInfo, My903SyncInfoSchema } from './entities/my903-sync-info.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: My903.name, schema: My903Schema },
      { name: My903SyncInfo.name, schema: My903SyncInfoSchema }
    ]),
    CommonModule,
  ],
  controllers: [My903Controller],
  providers: [My903Service],
  exports: [My903Service, MongooseModule]
})
export class My903Module {}
