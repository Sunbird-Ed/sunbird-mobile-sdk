import { ErrorType, TelemetryErrorCode } from './telemetry-constants';
export declare class TelemetryError extends Error {
    errorCode: TelemetryErrorCode;
    errorType: ErrorType;
    constructor(errorCode: TelemetryErrorCode, errorType: ErrorType);
}
