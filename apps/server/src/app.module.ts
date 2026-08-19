import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@verqik/database';
import { EmailModule } from '@verqik/email';
import { StorageModule } from '@verqik/storage';
import { AuthModule } from './modules/auth/auth.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { FilesModule } from './modules/files/files.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { HealthModule } from './modules/health/health.module';
import { JourneysModule } from './modules/journeys/journeys.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';

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
    RbacModule,
    AuthModule,
    UsersModule,
    FilesModule,
    JourneysModule,
    DeliveryModule,
    PaymentsModule,
    ReviewsModule,
    MessagingModule,
    DisputesModule,
    NotificationsModule,
    ReferenceModule,
    HealthModule,
    GatewayModule,
  ],
})
export class AppModule {}
