import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    // Only audit mutating requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const resource = url.split('/').filter(Boolean)[1] || 'unknown';

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Async, non-blocking audit log
          this.prisma.auditLog
            .create({
              data: {
                userId: user?.sub || null,
                action: method,
                resource,
                resourceId: responseData?.id || null,
                newValue: body || null,
                ip: ip || null,
                userAgent: headers['user-agent'] || null,
              },
            })
            .catch((err: Error) => this.logger.error('Audit log failed', err.message));
        },
        error: (err: Error) => {
          this.prisma.auditLog
            .create({
              data: {
                userId: user?.sub || null,
                action: `${method}_FAILED`,
                resource,
                newValue: { error: err.message, body },
                ip: ip || null,
                userAgent: headers['user-agent'] || null,
              },
            })
            .catch((e: Error) => this.logger.error('Audit log failed', e.message));
        },
      }),
    );
  }
}
