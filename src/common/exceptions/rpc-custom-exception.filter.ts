import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse();

    const rpcEerror = exception.getError();

    if (rpcEerror.toString().includes('Empty response')) {
      return response.status(500).json({
        status: 500,
        message: rpcEerror
          .toString()
          .substring(0, rpcEerror.toString().indexOf('(') - 1),
      });
    }

    if (
      typeof rpcEerror === 'object' &&
      'status' in rpcEerror &&
      'message' in rpcEerror
    ) {
      const status = isNaN(+rpcEerror.status) ? 400 : +rpcEerror.status;

      return response.status(status).json(rpcEerror);
    }

    response.status(400).json({
      status: 400,
      message: rpcEerror,
    });
  }
}
