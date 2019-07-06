import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {InvalidInputForSyncPreprocessorError} from '../errors/invalid-input-for-sync-preprocessor-error';

export class TelemetryEntriesToStringPreprocessor implements TelemetrySyncPreprocessor {
    process(input: any): any {
        if (typeof input !== 'object') {
            throw new InvalidInputForSyncPreprocessorError('TelemetryEntriesToStringPreprocessor expects input of type "object"');
        }

        return JSON.stringify(input);
    }
}
