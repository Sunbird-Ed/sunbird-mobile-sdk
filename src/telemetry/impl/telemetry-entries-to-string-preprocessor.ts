import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {InvalidInputForSyncPreprocessorError} from '../errors/invalid-input-for-sync-preprocessor-error';
import * as Collections from 'typescript-collections';

export class TelemetryEntriesToStringPreprocessor implements TelemetrySyncPreprocessor {
    process(input: any): any {
        if (!Array.isArray(input)) {
            throw new InvalidInputForSyncPreprocessorError('StringToByteArrayPreprocessor expects input of type "Telemetry[]"');
        }

        return Collections.util.makeString(input);
    }
}
