export interface HttpExceptionResponse {
  statusCode: number;
  error: string;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  success: boolean;
  path: string;
  method: string;
  timestamp: Date;
}
