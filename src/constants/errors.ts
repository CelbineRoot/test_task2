export enum ErrorStatus {
    badRequest = 400,
    unauthorized = 401,
    notFound = 404,
    notAcceptable = 406,
    conflict = 409,
    preconditionFailed = 412,
    unsupportedMediaType = 415,
    tooManyRequests = 429,
    internalServerError = 500,
}

export interface IError {
    status: ErrorStatus;
    message: string;
    data?: any;
}

export const validErrorStatus = [
    ErrorStatus.badRequest,
    ErrorStatus.unauthorized,
    ErrorStatus.notFound,
    ErrorStatus.notAcceptable,
    ErrorStatus.conflict,
    ErrorStatus.preconditionFailed,
    ErrorStatus.unsupportedMediaType,
    ErrorStatus.tooManyRequests,
    ErrorStatus.internalServerError,
];

export const instanceOfIError = (obj: any): obj is IError =>
    obj &&
    obj.message &&
    typeof obj.message === 'string' &&
    obj.status &&
    typeof obj.status === 'number' &&
    validErrorStatus.includes(obj.status);