import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { CreateJourneyDto, SearchJourneysDto } from './dto/journeys.dto';
import { JourneysService } from './journeys.service';

@ApiTags('journeys')
@ApiBearerAuth()
@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Post()
  @RequirePermissions('journeys:write')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateJourneyDto) {
    return this.journeysService.create(user.id, dto);
  }

  @Get()
  @RequirePermissions('journeys:read')
  search(@Query() query: SearchJourneysDto) {
    return this.journeysService.search(query);
  }

  @Patch(':id/cancel')
  @RequirePermissions('journeys:write')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.journeysService.cancel(id, user.id);
  }
}
