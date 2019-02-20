import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {InvalidInputForSyncPreprocessorError} from '../errors/invalid-input-for-sync-preprocessor-error';

export class StringToByteArrayPreprocessor implements TelemetrySyncPreprocessor {
    process(input: any): any {
        if (typeof input !== 'string') {
            throw new InvalidInputForSyncPreprocessorError('StringToByteArrayPreprocessor expects input of type "string"');
        }

        return new TextEncoder().encode(input);
    }
}
