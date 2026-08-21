import { HttpException, HttpStatus } from '@nestjs/common';
import type { AppErrorBody } from './app-error.types';

const DEFAULT_USER_MESSAGE = 'Something went wrong. Please try again.';

function extractMessage(response: unknown): string {
  if (typeof response === 'string') return response;
  if (typeof response === 'object' && response !== null) {
    const body = response as {
      message?: string | string[];
      userMessage?: string;
      errorMessage?: string;
    };
    if (body.userMessage) return body.userMessage;
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (body.message) return body.message;
    if (body.errorMessage) return body.errorMessage;
  }
  return DEFAULT_USER_MESSAGE;
}

function extractErrorMessage(response: unknown, fallback: string): string {
  if (typeof response === 'object' && response !== null) {
    const body = response as { errorMessage?: string; message?: string | string[] };
    if (body.errorMessage) return body.errorMessage;
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (body.message) return body.message;
  }
  if (typeof response === 'string') return response;
  return fallback;
}

export function resolveAppError(error: unknown): AppErrorBody {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    const status = error.getStatus();

    if (
      typeof response === 'object' &&
      response !== null &&
      'userMessage' in response &&
      'errorMessage' in response
    ) {
      const body = response as { userMessage: string; errorMessage: string };
      return {
        userMessage: body.userMessage,
        errorMessage: body.errorMessage,
        status,
      };
    }

    const message = extractMessage(response);
    return {
      userMessage: message,
      errorMessage: extractErrorMessage(response, message),
      status,
    };
  }

  if (error instanceof Error) {
    return {
      userMessage: DEFAULT_USER_MESSAGE,
      errorMessage: error.message || error.name,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    userMessage: DEFAULT_USER_MESSAGE,
    errorMessage: String(error),
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  };
}
