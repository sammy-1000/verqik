import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserProfileType } from '@verqik/database';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { EmailService } from '@verqik/email';
import { RbacService } from '../rbac/rbac.service';
import { UsersRepository } from '../users/users.repository';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const profileType = dto.profileType ?? UserProfileType.SENDER;

    const user = await this.usersRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      profileType,
    });

    const roleName =
      profileType === UserProfileType.TRAVELER
        ? 'traveler'
        : profileType === UserProfileType.BOTH
          ? 'sender'
          : 'sender';

    await this.rbacService.assignRole(user.id, roleName);
    if (profileType === UserProfileType.BOTH) {
      await this.rbacService.assignRole(user.id, 'traveler');
    }

    await this.usersRepository.createWallet(user.id);

    void this.emailService
      .send({
        to: user.email,
        subject: 'Welcome to Verqik',
        text: `Hi ${user.firstName}, welcome to Verqik!`,
      })
      .catch(() => undefined);

    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync({ sub: userId, email });
    const refreshToken = randomBytes(48).toString('hex');
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.usersRepository.storeRefreshToken(
      userId,
      tokenHash,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    return { accessToken, refreshToken };
  }
}
