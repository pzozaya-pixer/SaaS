import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class TelemetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Telemetry');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctxType = context.getType();
    if (ctxType !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        res.setHeader('X-Response-Time', `${duration}ms`);
        this.logger.log(`[${req.method}] ${req.url} - ${res.statusCode} - ${duration}ms`);
      }),
    );
  }
}
