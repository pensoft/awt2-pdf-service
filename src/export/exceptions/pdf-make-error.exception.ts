import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

export class PdfMakeErrorException extends BaseRpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<unknown> {
    if (exception instanceof RpcException) {
      return throwError({status: 6})
    }
    return super.catch(exception, host);
  }
}
