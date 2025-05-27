import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status: number;
      let message: string | string[];
      let error: string;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
  
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          const responseObj = exceptionResponse as any;
          message = responseObj.message || exception.message;
          error = responseObj.error || exception.name;
        } else {
          message = exceptionResponse as string;
          error = exception.name;
        }
      } else {
        // Error no controlado
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error interno del servidor';
        error = 'Internal Server Error';
  
        // Log del error para debugging
        this.logger.error(
          `Error no controlado: ${exception}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      }
  
      const errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        error,
        message,
      };
  
      // Log de errores 4xx y 5xx
      if (status >= 400) {
        this.logger.warn(
          `${request.method} ${request.url} - ${status} - ${message}`,
        );
      }
  
      response.status(status).json(errorResponse);
    }
  }