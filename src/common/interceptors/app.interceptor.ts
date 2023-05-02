import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetricsService } from '@app/common/metrics/metrics.service';
import { METRIC_TYPE } from '@app/common/interfaces/metrics.interface';
import { LoggerService } from '@app/common/services/logger.service';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(private readonly metricService: MetricsService,
              private readonly logger: LoggerService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        const request: Request = context.switchToHttp().getRequest();
        if (err instanceof HttpException) {
          this.updateMetrics(METRIC_TYPE.APPLICATION);
        } else {
          this.updateMetrics(METRIC_TYPE.UNKNOWN);
        }
        this.logger.server().error(err?.message || err?.detail || 'Something went wrong', {
          route: request.path,
          method: request.method
        })
        return throwError(
          () =>
            new HttpException(
              {
                message: err?.message || err?.detail || 'Something went wrong',
                timestamp: new Date().toISOString(),
                route: request.path,
                method: request.method
              },
              err.statusCode || 500
            )
        );
      })
    );
  }

  async updateMetrics(type: METRIC_TYPE) {
    switch (type) {
      case METRIC_TYPE.DATABASE:
        this.metricService.error_database.inc();
        break;
      case METRIC_TYPE.APPLICATION:
        this.metricService.error_application.inc();
        break;
      case METRIC_TYPE.MAIL_FAILURE:
        this.metricService.mail_failure_count.inc();
        break;
      default:
        this.metricService.error_unknown.inc();
    }
  }
}
