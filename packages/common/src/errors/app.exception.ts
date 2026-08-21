import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(params: {
    userMessage: string;
    errorMessage: string;
    status?: HttpStatus;
  }) {
    super(
      {
        userMessage: params.userMessage,
        errorMessage: params.errorMessage,
      },
      params.status ?? HttpStatus.BAD_REQUEST,
    );
  }
}
