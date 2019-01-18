import {ErrorCode, ErrorType} from './telemetry-constants';

export class TelemetryError extends Error {
    errorCode: ErrorCode;
    errorType: ErrorType;

    constructor(errorCode: ErrorCode, errorType: ErrorType) {
        super(errorCode as string + errorType);
        this.errorCode = errorCode;
        this.errorType = errorType;
        Object.setPrototypeOf(this, TelemetryError.prototype);
    }
}
