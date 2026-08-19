import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { RaiseDisputeDto, ResolveDisputeDto } from './dto/disputes.dto';
import { DisputesService } from './disputes.service';

@ApiTags('disputes')
@ApiBearerAuth()
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @RequirePermissions('delivery:write')
  raise(@CurrentUser() user: AuthUser, @Body() dto: RaiseDisputeDto) {
    return this.disputesService.raise(user.id, dto);
  }

  @Get('me')
  @RequirePermissions('disputes:read')
  listMine(@CurrentUser() user: AuthUser) {
    return this.disputesService.listForUser(user.id);
  }

  @Patch(':id/resolve')
  @RequirePermissions('disputes:manage')
  resolve(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(id, user.id, dto.resolution);
  }
}
