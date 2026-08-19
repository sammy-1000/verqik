import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async getProfile(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateProfile(
    userId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      profilePhotoUrl: string;
      countryCode: string;
    }>,
  ) {
    return this.repository.updateProfile(userId, data);
  }

  createAddress(
    userId: string,
    data: {
      label?: string;
      line1: string;
      line2?: string;
      city: string;
      countryCode: string;
      postalCode?: string;
    },
  ) {
    return this.repository.createAddress(userId, data);
  }

  listAddresses(userId: string) {
    return this.repository.listAddresses(userId);
  }
}
