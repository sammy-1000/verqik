import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

/** Cross-module integration point for rating updates — only Users module writes User rows. */
@Injectable()
export class UsersRatingService {
  constructor(private readonly repository: UsersRepository) {}

  async applyReview(userId: string, rating: number) {
    const user = await this.repository.findById(userId);
    if (!user) return null;

    const count = user.ratingCount + 1;
    const avg =
      (Number(user.ratingAvg) * user.ratingCount + rating) / count;

    return this.repository.updateRating(userId, avg, count);
  }
}
