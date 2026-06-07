import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MINIO_OPTIONS } from './minio.constants';
import { MinioOptions } from './minio.interface';

export interface MinioModuleOptions {
  useFactory: (...args: any[]) => Promise<MinioOptions> | MinioOptions;
  inject?: any[];
}

@Module({})
export class MinioModule {
  static forRoot(options: MinioOptions): DynamicModule {
    return {
      module: MinioModule,
      providers: [
        {
          provide: MINIO_OPTIONS,
          useValue: options,
        },
        MinioService,
      ],
      exports: [MinioService],
      global: true,
    };
  }

  static forRootAsync(options: MinioModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: MINIO_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      MinioService,
    ];

    return {
      module: MinioModule,
      providers,
      exports: [MinioService],
      global: true,
    };
  }
}
