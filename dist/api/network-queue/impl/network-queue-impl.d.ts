import { DbService } from '../../../db';
import { NetworkQueue, NetworkQueueRequest } from '../def/network-queue';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../../util/shared-preferences';
import { DeviceInfo } from '../../../util/device';
import { SdkConfig } from '../../../sdk-config';
export declare class NetworkQueueImpl implements NetworkQueue {
    private dbService;
    private sharedPreferences;
    private deviceInfo;
    private sdkConfig;
    constructor(dbService: DbService, sharedPreferences: SharedPreferences, deviceInfo: DeviceInfo, sdkConfig: SdkConfig);
    enqueue(request: NetworkQueueRequest, shouldSync: boolean): Observable<undefined>;
    private interceptRequest;
    private getTypeOf;
}
