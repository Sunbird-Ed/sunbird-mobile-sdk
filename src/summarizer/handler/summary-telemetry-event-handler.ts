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
        if (pdata != null && pdata.getPid() != null) {
            return pdata.getPid().includes(SummaryTelemetryEventHandler.CONTENT_PLAYER_PID);
        }
        return false;
    }

    private static checkIsCourse(event: SunbirdTelemetry.Telemetry): boolean {
        if (event.getObject() != null && event.getObject().type && event.getObject().type.toLowerCase() === 'course') {
            return true;
        }

        return false;
    }

    handle(event: SunbirdTelemetry.Telemetry): Observable<undefined> {
        if (event.getEid() === 'START' && SummaryTelemetryEventHandler.checkPData(event.getContext().getPData())) {
            // TODO: Swayangjit

            // getContentContextMap(appContext);
            //
            // if (contentContextMap != null && !contentContextMap.isEmpty()) {
            //     callUpdateContentStateAPI(event, event.getEid());
            // }

            return this.processOEStart(event)
                .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
        } else if (event.getEid() === 'START' && SummaryTelemetryEventHandler.checkIsCourse(event)) {
            // TODO: Swayangjit

            return Observable.of(undefined);
        } else if (event.getEid() === 'ASSESS' && SummaryTelemetryEventHandler.checkPData(event.getContext().getPData())) {
            return this.processOEAssess(event)
                .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
        } else if (event.getEid() === 'END' && SummaryTelemetryEventHandler.checkPData(event.getContext().getPData())) {
            return this.processOEEnd(event)
                .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
        } else if (event.getEid() === 'END' && SummaryTelemetryEventHandler.checkIsCourse(event)) {
            // TODO: Swayangjit

            return Observable.of(undefined);
        } else {
            return Observable.of(undefined);
        }
    }

    private processOEStart(event: Telemetry): Observable<undefined> {
        this.currentUID = event.getActor().id;
        this.currentContentID = event.getObject().id;

        return Observable.of(undefined);
    }

    private processOEAssess(event: Telemetry): Observable<undefined> {
        if (
            this.currentUID && this.currentContentID &&
            this.currentUID.toLocaleLowerCase() === event.getActor().id.toLocaleLowerCase() &&
            this.currentContentID.toLocaleLowerCase() === event.getObject().id.toLocaleLowerCase()
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

