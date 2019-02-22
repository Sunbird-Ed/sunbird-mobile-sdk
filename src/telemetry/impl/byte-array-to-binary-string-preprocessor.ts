import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {InvalidInputForSyncPreprocessorError} from '../errors/invalid-input-for-sync-preprocessor-error';
import * as pako from 'pako';

export class ByteArrayToBinaryStringPreprocessor implements TelemetrySyncPreprocessor {
    process(input: any): any {
        if (!(input instanceof Uint8Array)) {
            throw new InvalidInputForSyncPreprocessorError('ByteArrayToBinaryStringPreprocessor expects input of type "UInt8Array"');
        }

        return pako.gzip(input, {to: 'string'});
    }
}
