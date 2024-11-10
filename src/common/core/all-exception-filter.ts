import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as fs from 'fs';
import { CustomHttpExceptionResponse } from '../interface/http-exception-response';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorMessage =
        (errorResponse as HttpException)?.message || exception?.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = (exception as HttpException)?.message;
    }

    const errorResponse: CustomHttpExceptionResponse = this.getErrorResponse(
      status,
      errorMessage,
      request,
    );

    this.logError(this.getErrorLog(errorResponse, request, exception));
    return response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
  ): CustomHttpExceptionResponse => ({
    statusCode: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timestamp: new Date(),
    success: false,
  });

  private getErrorLog = (
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: unknown,
  ): string => {
    const { statusCode, error } = errorResponse;
    const { method, url } = request;
    const errorLog = `Response code ${statusCode} - method ${method} - URL ${url}\n
    Error: ${JSON.stringify(errorResponse)}\n
    ${exception instanceof HttpException ? exception.stack : error}\n
    ________________________________________________________________________\n`;
    return errorLog;
  };

  private logError(message: string): void {
    fs.appendFile('error.log', message, 'utf8', (err) => {
      if (err) throw err;
    });
  }
}
