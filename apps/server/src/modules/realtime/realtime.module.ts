import { Global, Module } from '@nestjs/common';
import { GatewayPushService } from './gateway-push.service';

@Global()
@Module({
  providers: [GatewayPushService],
  exports: [GatewayPushService],
})
export class RealtimeModule {}
