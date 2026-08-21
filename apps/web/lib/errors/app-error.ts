export interface AppErrorBody {
  userMessage: string;
  errorMessage: string;
  status: number;
}

export class AppError extends Error {
  readonly userMessage: string;
  readonly errorMessage: string;
  readonly status: number;

  constructor(body: AppErrorBody) {
    super(body.userMessage);
    this.name = 'AppError';
    this.userMessage = body.userMessage;
    this.errorMessage = body.errorMessage;
    this.status = body.status;
  }
}

export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function isAppErrorBody(value: unknown): value is AppErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userMessage' in value &&
    'errorMessage' in value &&
    'status' in value
  );
}
