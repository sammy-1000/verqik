import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

/** Read-only cross-module user lookups. Other modules must not write User records. */
@Injectable()
export class UsersQueryService {
  constructor(private readonly repository: UsersRepository) {}

  findById(id: string) {
    return this.repository.findById(id);
  }
}
