import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { CreateAdminUserDto, ListAdminUsersQueryDto } from './dto/admin-users.dto';
import { AdminUsersService } from './admin-users.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @RequirePermissions('users:manage')
  list(@Query() query: ListAdminUsersQueryDto) {
    return this.adminUsersService.list({ q: query.q });
  }

  @Post()
  @RequirePermissions('users:manage')
  createAdmin(@CurrentUser() _user: AuthUser, @Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.createAdmin(dto);
  }
}
