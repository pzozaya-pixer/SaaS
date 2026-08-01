import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class TelemetryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('TelemetryException');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message || 'Internal server error';

    // Log estructurado de telemetría (Sentry/OpenTelemetry mock tracker)
    const errPayload = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      organizationId: request.headers['x-organization-id'] || 'N/A',
      message: typeof message === 'object' ? (message as any).message || message : message,
      stack: exception.stack || null,
    };

    this.logger.error(`[EXCEPTION] ${request.method} ${request.url} - Status: ${status} - Error: ${errPayload.message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      timestamp: errPayload.timestamp,
      path: request.url,
      message: errPayload.message,
    });
  }
}
