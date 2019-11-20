import { OpenRapConfigurable } from '../../open-rap-configurable';
export interface TelemetryConfig extends OpenRapConfigurable {
    apiPath: string;
    telemetrySyncBandwidth: number;
    telemetrySyncThreshold: number;
    telemetryLogMinAllowedOffset: number;
}
