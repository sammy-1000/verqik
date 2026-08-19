import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { SendMessageDto } from './dto/messaging.dto';
import { MessagingService } from './messaging.service';

@ApiTags('messaging')
@ApiBearerAuth()
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @RequirePermissions('delivery:write')
  send(@CurrentUser() user: AuthUser, @Body() dto: SendMessageDto) {
    return this.messagingService.send(user.id, dto);
  }

  @Get('requests/:id')
  @RequirePermissions('delivery:read')
  list(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.messagingService.list(id, user.id);
  }
}
