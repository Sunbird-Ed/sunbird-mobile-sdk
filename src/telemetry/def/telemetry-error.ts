import {ErrorType, TelemetryErrorCode} from './telemetry-constants';

export class TelemetryError extends Error {
    errorCode: TelemetryErrorCode;
    errorType: ErrorType;

    constructor(errorCode: TelemetryErrorCode, errorType: ErrorType) {
        super(errorCode + errorType);
        this.errorCode = errorCode;
        this.errorType = errorType;
        Object.setPrototypeOf(this, TelemetryError.prototype);
    }
}
