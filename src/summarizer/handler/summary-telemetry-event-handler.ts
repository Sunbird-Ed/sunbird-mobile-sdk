import {ApiRequestHandler} from '../../api';
import {ProducerData, TelemetryEvents} from '../../telemetry';
import {Observable} from 'rxjs';
import {SummarizerService} from '../def/summarizer-service';
import Telemetry = TelemetryEvents.Telemetry;

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

    handle(event: TelemetryEvents.Telemetry): Observable<undefined> {
        if (SummaryTelemetryEventHandler.checkPData(event.getContext().getPData())) {
            return this.processEvent(event);
        }

        return Observable.of(undefined);
    }

    private processEvent(event: Telemetry): Observable<undefined> {
        switch (event.getEid()) {
            case 'START': {
                return this.processOEStart(event)
                    .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
            }
            case 'ASSESS': {
                return this.processOEAssess(event)
                    .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
            }
            case 'END': {
                return this.processOEEnd(event)
                    .mergeMap(() => this.summarizerService.saveLearnerAssessmentDetails(event).mapTo(undefined));
            }
            default: {
                return Observable.of(undefined);
            }
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
            return this.summarizerService.deletePreviousAssessmentDetails({
                uid: this.currentUID,
                contentId: this.currentContentID
            }).do(() => {
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

