import { ErrorCode, ErrorType } from './telemetry-constants';
export declare class TelemetryError extends Error {
    errorCode: ErrorCode;
    errorType: ErrorType;
    constructor(errorCode: ErrorCode, errorType: ErrorType);
}
