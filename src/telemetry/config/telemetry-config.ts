import {OpenRapConfigurable} from '../../open-rap-configurable';

export interface TelemetryConfig extends OpenRapConfigurable {
    telemetryApiPath: string;
    telemetrySyncBandwidth: number;
    telemetrySyncThreshold: number;
    telemetryLogMinAllowedOffset: number; // in ms
}
