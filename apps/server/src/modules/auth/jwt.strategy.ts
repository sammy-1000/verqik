import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RbacService } from '../rbac/rbac.service';
import { UsersQueryService } from '../users/users-query.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersQuery: UsersQueryService,
    private readonly rbacService: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: JwtPayload) {
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
