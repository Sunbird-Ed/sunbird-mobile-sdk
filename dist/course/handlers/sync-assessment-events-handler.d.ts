import { Observable } from 'rxjs';
import { SunbirdTelemetry } from '../../telemetry';
import { ApiService } from '../../api';
import { DbService } from '../../db';
import { SdkConfig } from '../../sdk-config';
import { CourseService } from '..';
export declare class SyncAssessmentEventsHandler {
    private courseService;
    private sdkConfig;
    private apiService;
    private dbService;
    private static readonly UPDATE_CONTENT_STATE_ENDPOINT;
    private capturedAssessmentEvents;
    constructor(courseService: CourseService, sdkConfig: SdkConfig, apiService: ApiService, dbService: DbService);
    handle(capturedAssessmentEvents: {
        [key: string]: SunbirdTelemetry.Telemetry[] | undefined;
    }): Observable<undefined>;
    private invokeSyncApi;
    private persistAssessEvent;
    private syncCapturedAssessmentEvents;
    private syncPersistedAssessmentEvents;
}
