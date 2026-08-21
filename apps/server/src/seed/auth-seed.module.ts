import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { isValidJwtExpiresIn, parseJwtExpiresIn } from '@verqik/common';
import { RbacModule } from '../modules/rbac/rbac.module';
import { UsersModule } from '../modules/users/users.module';
import { AuthService } from '../modules/auth/auth.service';

/** AuthService wiring for CLI/scripts — no Passport guards or JwtStrategy */
@Module({
  imports: [
    RbacModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const configured = config.get<string>('JWT_EXPIRES_IN');
        const expiresIn = parseJwtExpiresIn(configured);
        if (configured && !isValidJwtExpiresIn(configured)) {
          // eslint-disable-next-line no-console
          console.warn(`Invalid JWT_EXPIRES_IN "${configured}" — using "${expiresIn}"`);
        }
        return {
          secret: config.get<string>('JWT_SECRET', 'change-me'),
          signOptions: { expiresIn: expiresIn as `${number}d` },
        };
      },
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthSeedModule {}
