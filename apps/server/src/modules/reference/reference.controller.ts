import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@verqik/common';
import { ListCitiesQueryDto } from '../admin/dto/admin-cities.dto';
import { ReferenceService } from './reference.service';

@ApiTags('reference')
@Controller('reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Public()
  @Get('countries')
  listCountries() {
    return this.referenceService.listCountries();
  }

  @Public()
  @Get('cities')
  listCities(@Query() query: ListCitiesQueryDto) {
    return this.referenceService.listCities({
      countryCode: query.countryCode,
      q: query.q,
      enabledOnly: !query.includeDisabled,
    });
  }
}
