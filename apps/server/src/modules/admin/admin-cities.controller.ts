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
  CreateCityDto,
  ListCitiesQueryDto,
  UpdateCityDto,
} from './dto/admin-cities.dto';
import { AdminCitiesService } from './admin-cities.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/cities')
export class AdminCitiesController {
  constructor(private readonly adminCitiesService: AdminCitiesService) {}

  @Get()
  @RequirePermissions('cities:manage')
  list(@Query() query: ListCitiesQueryDto) {
    return this.adminCitiesService.list({
      countryCode: query.countryCode,
      q: query.q,
    });
  }

  @Get(':id')
  @RequirePermissions('cities:manage')
  getById(@Param('id') id: string) {
    return this.adminCitiesService.getById(id);
  }

  @Post()
  @RequirePermissions('cities:manage')
  create(@Body() dto: CreateCityDto, @CurrentUser() user: AuthUser) {
    return this.adminCitiesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('cities:manage')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCityDto,
  ) {
    return this.adminCitiesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('cities:manage')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.adminCitiesService.remove(id, user.id);
  }
}
