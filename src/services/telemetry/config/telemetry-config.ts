import {OpenRapConfigurable} from '../../../open-rap-configurable';

export interface TelemetryConfig extends OpenRapConfigurable {
    deviceRegisterHost: string;
    deviceRegisterApiPath: string;
    telemetryApiPath: string;
    telemetrySyncBandwidth: number;
    telemetrySyncThreshold: number;
    telemetryLogMinAllowedOffset: number; // in ms
    fcmToken?: string;
}
