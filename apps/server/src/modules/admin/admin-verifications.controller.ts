import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { RejectVerificationDto } from './dto/admin-verifications.dto';
import { AdminVerificationsService } from './admin-verifications.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/verifications')
export class AdminVerificationsController {
  constructor(
    private readonly adminVerificationsService: AdminVerificationsService,
  ) {}

  @Get()
  @RequirePermissions('verification:read')
  listPending() {
    return this.adminVerificationsService.listPending();
  }

  @Get(':id')
  @RequirePermissions('verification:read')
  getDetail(@Param('id') id: string) {
    return this.adminVerificationsService.getDetail(id);
  }

  @Post(':id/approve')
  @RequirePermissions('verification:review')
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.adminVerificationsService.approve(id, user.id);
  }

  @Post(':id/reject')
  @RequirePermissions('verification:review')
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RejectVerificationDto,
  ) {
    return this.adminVerificationsService.reject(id, user.id, dto.rejectionReason);
  }
}
