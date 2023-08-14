import { WsException } from '@nestjs/websockets';
import {ErrorStatus, IError} from '../../constants';

export enum WS_EXCEPTION {
  BAD_REQUEST = 'BadRequest',
  UNAUTHORIZED = 'Unauthorized',
  UNKNOWN = 'Unknown',
  NOT_FOUND = 'NotFound',
}

export class WsTypeException extends WsException {
  readonly type: WS_EXCEPTION;

  constructor(type: WS_EXCEPTION, message: string | unknown) {
    const error = {
      type,
      message,
    };
    super(error);
    this.type = type;
  }
}

export class WsBadRequestException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WS_EXCEPTION.BAD_REQUEST, message);
  }
}

export class WsUnauthorizedException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WS_EXCEPTION.UNAUTHORIZED, message);
  }
}

export class WsUnknownException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WS_EXCEPTION.UNKNOWN, message);
  }
}

export class WsNotFoundException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WS_EXCEPTION.NOT_FOUND, message);
  }
}

export const baseGenerateWsErrorCode = (
  err: IError,
  isBadRequestByDefault = false,
) => {
  let error: WsTypeException;
  switch (err.status) {
    case ErrorStatus.badRequest:
      error = new WsBadRequestException(err.message);
      break;

    case ErrorStatus.unauthorized:
      error = new WsUnauthorizedException(err.message);
      break;

    case ErrorStatus.notFound:
      error = new WsNotFoundException(err.message);
      break;

    case ErrorStatus.internalServerError:
      error = new WsUnknownException(err.message);
      break;

    default:
      error = isBadRequestByDefault
        ? new WsBadRequestException(`${err.status}` || err.message || '')
        : new WsUnknownException(err.message);
      break;
  }

  return error;
};
