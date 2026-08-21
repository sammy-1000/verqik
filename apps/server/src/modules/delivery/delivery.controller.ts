import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import {
  CreateDeliveryRequestDto,
  TransitionDeliveryDto,
} from './dto/delivery.dto';
import { DeliveryService } from './delivery.service';

@ApiTags('delivery')
@ApiBearerAuth()
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('categories')
  @RequirePermissions('delivery:read')
  listCategories() {
    return this.deliveryService.listCategories();
  }

  @Post('requests')
  @RequirePermissions('delivery:write')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDeliveryRequestDto,
  ) {
    return this.deliveryService.createRequest(user.id, dto);
  }

  @Get('requests')
  @RequirePermissions('delivery:read')
  list(@CurrentUser() user: AuthUser) {
    return this.deliveryService.listForUser(user.id);
  }

  @Get('requests/:id')
  @RequirePermissions('delivery:read')
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.deliveryService.getById(id, user.id);
  }

  @Patch('requests/:id/status')
  @RequirePermissions('delivery:write')
  transition(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: TransitionDeliveryDto,
  ) {
    return this.deliveryService.transition(id, user.id, dto);
  }
}
