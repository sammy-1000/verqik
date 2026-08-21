import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { AppErrorResponse } from './app-error.types';
import { resolveAppError } from './resolve-app-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { json: (body: AppErrorResponse) => void } }>();
    const { userMessage, errorMessage, status } = resolveAppError(exception);

    if (status >= 500) {
      this.logger.error(errorMessage, exception instanceof Error ? exception.stack : undefined);
    } else if (exception instanceof HttpException) {
      this.logger.warn(errorMessage);
    } else {
      this.logger.error(errorMessage, exception instanceof Error ? exception.stack : undefined);
    }

    const body: AppErrorResponse = {
      userMessage,
      errorMessage,
      statusCode: status,
    };

    response.status(status).json(body);
  }
}
