import { ApiRequestHandler } from '../../api';
import { SunbirdTelemetry } from '../../telemetry';
import { Observable } from 'rxjs';
import { SummarizerService } from '..';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class SummaryTelemetryEventHandler implements ApiRequestHandler<Telemetry, undefined> {
    private summarizerService;
    private static readonly CONTENT_PLAYER_PID;
    private currentUID?;
    private currentContentID?;
    constructor(summarizerService: SummarizerService);
    private static checkPData;
    private static checkIsCourse;
    handle(event: SunbirdTelemetry.Telemetry): Observable<undefined>;
    private processOEStart;
    private processOEAssess;
    private processOEEnd;
}
