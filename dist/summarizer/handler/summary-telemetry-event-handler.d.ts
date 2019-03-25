import { ApiRequestHandler } from '../../api';
import { SunbirdTelemetry } from '../../telemetry';
import { Observable } from 'rxjs';
import { SummarizerService } from '..';
import { CourseService } from '../../course';
import { SharedPreferences } from '../../util/shared-preferences';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class SummaryTelemetryEventHandler implements ApiRequestHandler<Telemetry, undefined> {
    private courseService;
    private sharedPreference;
    private summarizerService;
    private static readonly CONTENT_PLAYER_PID;
    private currentUID?;
    private currentContentID?;
    private courseContext;
    constructor(courseService: CourseService, sharedPreference: SharedPreferences, summarizerService: SummarizerService);
    private static checkPData;
    private static checkIsCourse;
    private setCourseContextEmpty;
    updateContentState(event: Telemetry): Observable<undefined>;
    handle(event: SunbirdTelemetry.Telemetry): Observable<undefined>;
    private getCourseContext;
    private checkStatusOfContent;
    private getStatus;
    private processOEStart;
    private processOEAssess;
    private processOEEnd;
}
