import {ApiRequestHandler} from '../../api';
import {TelemetrySyncStat} from '..';
import {Observable} from 'rxjs';
import * as pako from 'pako';

export class TelemetrySyncHandler implements ApiRequestHandler<undefined, TelemetrySyncStat> {
    handle(): Observable<TelemetrySyncStat> {
        return this.byteArrayToGzippedBinaryString(this.stringToByteArray('Hello World')) as any;
    }

    stringToByteArray(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }

    byteArrayToGzippedBinaryString(byteArray: Uint8Array): Promise<string> {
        return pako.deflate(byteArray, {to: 'string'});
    }
}
