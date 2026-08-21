import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@verqik/database';
import { EmailModule } from '@verqik/email';
import { StorageModule } from '@verqik/storage';
import { ReferenceModule } from '../modules/reference/reference.module';
import { RealtimeModule } from '../modules/realtime/realtime.module';
import { DemoSeedModule } from './demo-seed.module';

/** Lightweight Nest context for seed/demo CLI — avoids HTTP auth stack */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    RealtimeModule,
    StorageModule.forRootAsync(),
    EmailModule.forRootAsync(),
    ReferenceModule,
    DemoSeedModule,
  ],
})
export class SeedCliModule {}
