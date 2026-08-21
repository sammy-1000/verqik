import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { DisputesModule } from '../disputes/disputes.module';
import { FilesModule } from '../files/files.module';
import { JourneysModule } from '../journeys/journeys.module';
import { MessagingModule } from '../messaging/messaging.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { RbacModule } from '../rbac/rbac.module';
import { ReferenceModule } from '../reference/reference.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { UsersModule } from '../users/users.module';
import { AppGateway } from './app.gateway';
import { GatewayDispatcherService } from './gateway-dispatcher.service';
import { WsAuthService } from './ws-auth.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me'),
      }),
    }),
    AuthModule,
    AdminModule,
    UsersModule,
    RbacModule,
    FilesModule,
    JourneysModule,
    DeliveryModule,
    PaymentsModule,
    ReviewsModule,
    MessagingModule,
    DisputesModule,
    NotificationsModule,
    ReferenceModule,
  ],
  providers: [AppGateway, GatewayDispatcherService, WsAuthService],
  exports: [AppGateway, GatewayDispatcherService],
})
export class GatewayModule {}
