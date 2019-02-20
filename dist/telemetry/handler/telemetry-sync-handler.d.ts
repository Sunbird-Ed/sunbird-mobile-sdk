import { ApiRequestHandler } from '../../api';
import { TelemetrySyncStat } from '..';
import { Observable } from 'rxjs';
export declare class TelemetrySyncHandler implements ApiRequestHandler<undefined, TelemetrySyncStat> {
    handle(): Observable<TelemetrySyncStat>;
    stringToByteArray(str: string): Uint8Array;
    byteArrayToGzippedBinaryString(byteArray: Uint8Array): Promise<string>;
}
