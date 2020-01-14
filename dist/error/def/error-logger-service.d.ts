import { Observable } from 'rxjs';
import { TelemetryErrorRequest } from '../../telemetry';
import { SdkServiceOnInitDelegate } from '../../sdk-service-on-init-delegate';
export interface ErrorLoggerService extends SdkServiceOnInitDelegate {
    logError(request: TelemetryErrorRequest): Observable<undefined>;
}
