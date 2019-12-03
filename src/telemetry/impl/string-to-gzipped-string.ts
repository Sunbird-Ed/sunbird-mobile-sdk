import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {InvalidInputForSyncPreprocessorError} from '../errors/invalid-input-for-sync-preprocessor-error';
import {gzip} from 'pako/dist/pako_deflate';

export class StringToGzippedString implements TelemetrySyncPreprocessor {
    process(input: any): any {
        if (!(typeof input === 'string')) {
            throw new InvalidInputForSyncPreprocessorError('StringToGzippedString expects input of type "string"');
        }

        return gzip(input, {to: 'string'});
    }
}
