import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_OPTIONS, type EmailModuleOptions } from './email.interface';
import { EmailService } from './email.service';

@Module({})
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      global: true,
      providers: [{ provide: EMAIL_OPTIONS, useValue: options }, EmailService],
      exports: [EmailService],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: EmailModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: EMAIL_OPTIONS,
          inject: [ConfigService],
          useFactory: (config: ConfigService): EmailModuleOptions => ({
            host: config.get<string>('SMTP_HOST', 'localhost'),
            port: config.get<number>('SMTP_PORT', 587),
            secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
            user: config.get<string>('SMTP_USER', ''),
            pass: config.get<string>('SMTP_PASS', ''),
            from: config.get<string>('SMTP_FROM', 'noreply@verqik.com'),
          }),
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}

export { EmailService } from './email.service';
export * from './email.interface';
