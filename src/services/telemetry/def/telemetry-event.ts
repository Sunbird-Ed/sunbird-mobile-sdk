import {EventsBusEvent} from '../../events-bus';
import {SunbirdTelemetry} from './telemetry-model';

export interface TelemetryEvent extends EventsBusEvent {
    type: TelemetryEventType;
}

export interface TelemetrySave extends TelemetryEvent {
    type: TelemetryEventType.SAVE;
    payload: SunbirdTelemetry.Telemetry;
}

export enum TelemetryEventType {
    SAVE = 'SAVE'
}
