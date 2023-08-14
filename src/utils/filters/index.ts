import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  WsExceptionFilter,
} from '@nestjs/common';
import { Socket } from 'socket.io';

import {
  baseGenerateWsErrorCode,
  WsBadRequestException,
  WsTypeException,
  WsUnknownException,
} from '../exceptions';
import {instanceOfIError, EXCEPTION_EVENTS} from '../../constants';

@Catch()
export class WSCatchAllFilter implements WsExceptionFilter {
  constructor(private exceptionName = EXCEPTION_EVENTS.EXCEPTION) {}
  catch(exception: Error, host: ArgumentsHost) {
    const socket: Socket = host.switchToWs().getClient();

    if (exception instanceof BadRequestException) {
      const exceptionData = exception.getResponse() as
        | { message?: string | string[] }
        | string;

      const exceptionMessage =
        typeof exceptionData === 'string'
          ? exceptionData
          : exceptionData.message?.toString() ?? exception.name;

      const wsException = new WsBadRequestException(exceptionMessage);
      socket.emit(this.exceptionName, wsException.getError());
      return;
    }

    if (instanceOfIError(exception)) {
      socket.emit(
        this.exceptionName,
        baseGenerateWsErrorCode(exception).getError(),
      );
      return;
    }

    if (exception instanceof WsTypeException) {
      socket.emit(this.exceptionName, exception.getError());
      return;
    }

    const wsException = new WsUnknownException(exception.message);
    socket.emit(this.exceptionName, wsException.getError());
  }
}
