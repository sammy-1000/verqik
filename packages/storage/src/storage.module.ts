import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_OPTIONS, type StorageModuleOptions } from './storage.interface';
import { StorageService } from './storage.service';

@Module({})
export class StorageModule {
  static forRoot(options: StorageModuleOptions): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        { provide: STORAGE_OPTIONS, useValue: options },
        StorageService,
      ],
      exports: [StorageService],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: STORAGE_OPTIONS,
          inject: [ConfigService],
          useFactory: (config: ConfigService): StorageModuleOptions => ({
            endpoint: config.get<string>('STORAGE_ENDPOINT'),
            region: config.get<string>('STORAGE_REGION', 'us-east-1'),
            accessKeyId: config.get<string>('STORAGE_ACCESS_KEY_ID', ''),
            secretAccessKey: config.get<string>(
              'STORAGE_SECRET_ACCESS_KEY',
              '',
            ),
            bucket: config.get<string>('STORAGE_BUCKET', ''),
            forcePathStyle:
              config.get<string>('STORAGE_FORCE_PATH_STYLE', 'false') ===
              'true',
            cdnUrl: config.get<string>('STORAGE_CDN_URL'),
          }),
        },
        StorageService,
      ],
      exports: [StorageService],
    };
  }
}

export { StorageService } from './storage.service';
export * from './storage.interface';
