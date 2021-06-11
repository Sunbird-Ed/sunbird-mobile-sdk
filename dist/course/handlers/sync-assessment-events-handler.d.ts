import { Observable } from 'rxjs';
import { SunbirdTelemetry } from '../../telemetry';
import { DbService } from '../../db';
import { SdkConfig } from '../../sdk-config';
import { CourseService } from '..';
import { NetworkQueue } from '../../api/network-queue';
export declare class SyncAssessmentEventsHandler {
    private courseService;
    private sdkConfig;
    private dbService;
    private networkQueue;
    private static readonly UPDATE_CONTENT_STATE_ENDPOINT;
    private capturedAssessmentEvents;
    constructor(courseService: CourseService, sdkConfig: SdkConfig, dbService: DbService, networkQueue: NetworkQueue);
    handle(capturedAssessmentEvents: {
        [key: string]: SunbirdTelemetry.Telemetry[] | undefined;
    }): Observable<undefined>;
    private invokeSyncApi;
    private persistAssessEvent;
    private syncCapturedAssessmentEvents;
    private syncPersistedAssessmentEvents;
}
