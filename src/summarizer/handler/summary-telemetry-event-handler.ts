import {ApiRequestHandler} from '../../api';
import {ProducerData, SunbirdTelemetry} from '../../telemetry';
import {Observable} from 'rxjs';
import {SummarizerService} from '..';
import Telemetry = SunbirdTelemetry.Telemetry;

export class SummaryTelemetryEventHandler implements ApiRequestHandler<Telemetry, undefined> {
    private static readonly CONTENT_PLAYER_PID = 'contentplayer';

    private currentUID?: string = undefined;
    private currentContentID?: string = undefined;

    constructor(private summarizerService: SummarizerService) {
    }

    private static checkPData(pdata: ProducerData): boolean {
        if (pdata != null && pdata.pid !== null) {
            return pdata.pid.includes(SummaryTelemetryEventHandler.CONTENT_PLAYER_PID);
        }
        return false;
    }

    private static checkIsCourse(event: SunbirdTelemetry.Telemetry): boolean {
        if (event.object != null && event.object.type && event.object.type.toLowerCase() === 'course') {
            return true;
        }

        return false;
    }

    handle(event: SunbirdTelemetry.Telemetry): Observable<undefined> {
        if (event.eid === 'START' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
            // TODO: Swayangjit

            // getContentContextMap(appContext);
            //
            // if (contentContextMap != null && !contentContextMap.isEmpty()) {
            //     callUpdateContentStateAPI(event, event.eid);
            // }

            return this.processOEStart(event)
                .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
        } else if (event.eid === 'START' && SummaryTelemetryEventHandler.checkIsCourse(event)) {
            // TODO: Swayangjit

            return Observable.of(undefined);
        } else if (event.eid === 'ASSESS' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
            return this.processOEAssess(event)
                .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
        } else if (event.eid === 'END' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
            return this.processOEEnd(event)
                .mergeMap(() => this.summarizerService.saveLearnerContentSummaryDetails(event).mapTo(undefined));
        } else if (event.eid === 'END' && SummaryTelemetryEventHandler.checkIsCourse(event)) {
            // TODO: Swayangjit

            return Observable.of(undefined);
        } else {
            return Observable.of(undefined);
        }
    }

    private processOEStart(event: Telemetry): Observable<undefined> {
        this.currentUID = event.actor.id;
        this.currentContentID = event.object.id;

        return Observable.of(undefined);
    }

    private processOEAssess(event: Telemetry): Observable<undefined> {
        if (
            this.currentUID && this.currentContentID &&
            this.currentUID.toLocaleLowerCase() === event.actor.id.toLocaleLowerCase() &&
            this.currentContentID.toLocaleLowerCase() === event.object.id.toLocaleLowerCase()
        ) {
            return this.summarizerService.deletePreviousAssessmentDetails(
                this.currentUID,
                this.currentContentID
            ).do(() => {
                this.currentUID = undefined;
                this.currentContentID = undefined;
            }).mapTo(undefined);
        }

        return Observable.of(undefined);
    }

    private processOEEnd(event: Telemetry): Observable<undefined> {
        return Observable.of(undefined);
    }
}

