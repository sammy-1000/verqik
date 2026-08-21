import { Module } from '@nestjs/common';
import { DeliveryModule } from '../modules/delivery/delivery.module';
import { JourneysModule } from '../modules/journeys/journeys.module';
import { UsersModule } from '../modules/users/users.module';
import { AdminSeedModule } from './admin-seed.module';
import { AuthSeedModule } from './auth-seed.module';
import { DemoSeedService } from './demo-seed.service';

/** Service bundle reused by SeedCliModule */
@Module({
  imports: [AuthSeedModule, UsersModule, AdminSeedModule, JourneysModule, DeliveryModule],
  providers: [DemoSeedService],
  exports: [DemoSeedService],
})
export class DemoSeedModule {}
