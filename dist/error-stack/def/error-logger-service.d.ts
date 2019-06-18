import { Observable } from 'rxjs';
import { ErrorStack } from '../def/error-stack';
export interface ErrorLoggerService {
    logError(errorStack: ErrorStack): Observable<undefined>;
    clearLogs(): Observable<undefined>;
}
