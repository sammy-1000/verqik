import { Injectable } from '@nestjs/common';
import { PrismaService } from '@verqik/database';

@Injectable()
export class ReferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  listCountries() {
    return this.prisma.country.findMany({ orderBy: { name: 'asc' } });
  }
}

@Injectable()
export class ReferenceService {
  constructor(private readonly repository: ReferenceRepository) {}

  listCountries() {
    return this.repository.listCountries();
  }
}
