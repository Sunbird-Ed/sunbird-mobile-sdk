import { KeyValueStore } from '../../key-value-store';
import { SunbirdTelemetry } from '../../telemetry';
export declare class OfflineAssessmentScoreProcessor {
    private keyValueStore;
    constructor(keyValueStore: KeyValueStore);
    process(capturedAssessments: {
        [key: string]: SunbirdTelemetry.Telemetry[] | undefined;
    }): Promise<void>;
}
