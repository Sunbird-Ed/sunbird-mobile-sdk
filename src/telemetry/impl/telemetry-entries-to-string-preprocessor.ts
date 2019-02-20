import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {InvalidInputForSyncPreprocessorError} from '../errors/invalid-input-for-sync-preprocessor-error';
import * as Collections from 'typescript-collections';

export class TelemetryEntriesToStringPreprocessor implements TelemetrySyncPreprocessor {
    process(input: any): any {
        if (typeof input !== 'object') {
            throw new InvalidInputForSyncPreprocessorError('TelemetryEntriesToStringPreprocessor expects input of type "object"');
        }

        return Collections.util.makeString(input);
    }
}
