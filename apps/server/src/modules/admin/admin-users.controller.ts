import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import {
  CreateAdminUserDto,
  ListAdminUsersQueryDto,
  UpdateAdminUserDto,
} from './dto/admin-users.dto';
import { AdminUsersService } from './admin-users.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @RequirePermissions('users:manage')
  list(@Query() query: ListAdminUsersQueryDto) {
    return this.adminUsersService.list({
      q: query.q,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  @RequirePermissions('users:manage')
  getById(@Param('id') id: string) {
    return this.adminUsersService.getById(id);
  }

  @Post()
  @RequirePermissions('users:manage')
  create(@CurrentUser() _user: AuthUser, @Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.createUser(dto);
  }

  @Patch(':id')
  @RequirePermissions('users:manage')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.updateUser(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('users:manage')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.adminUsersService.deleteUser(id, user.id);
  }
}
