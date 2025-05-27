import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { ClassSerializerInterceptor } from '@nestjs/common';
  
  export interface Response<T> {
    data: T;
    message?: string;
    statusCode: number;
    timestamp: string;
    path: string;
  }
  
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
  {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<T>> {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
  
      return next.handle().pipe(
        map((data) => ({
          data,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
        })),
      );
    }
  }