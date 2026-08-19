import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser } from '@verqik/common';
import { RbacService } from '../rbac/rbac.service';
import { UsersQueryService } from '../users/users-query.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class WsAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersQuery: UsersQueryService,
    private readonly rbacService: RbacService,
  ) {}

  extractToken(auth?: {
    token?: string;
    authorization?: string;
  }): string | undefined {
    if (auth?.token) return auth.token;
    const header = auth?.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return undefined;
  }

  async authenticate(token?: string): Promise<AuthUser> {
    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>('JWT_SECRET', 'change-me'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersQuery.findById(payload.sub);
    if (!user?.isActive) {
      throw new UnauthorizedException('User inactive or not found');
    }

    const permissions = await this.rbacService.getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      permissions,
    };
  }
}
