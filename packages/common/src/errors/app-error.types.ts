export interface AppErrorBody {
  userMessage: string;
  errorMessage: string;
  status: number;
}

export interface AppErrorResponse {
  userMessage: string;
  errorMessage: string;
  statusCode: number;
}
