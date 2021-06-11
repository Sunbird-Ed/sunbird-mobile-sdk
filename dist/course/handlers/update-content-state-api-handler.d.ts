import { ApiRequestHandler } from '../../api';
import { UpdateContentStateAPIRequest } from '..';
import { Observable } from 'rxjs';
import { NetworkQueue } from '../../api/network-queue';
import { SdkConfig } from '../../sdk-config';
export declare class UpdateContentStateApiHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, {
    [key: string]: any;
}> {
    private networkQueue;
    private sdkConfig;
    static readonly UPDATE_CONTENT_STATE_ENDPOINT: string;
    constructor(networkQueue: NetworkQueue, sdkConfig: SdkConfig);
    handle(updateContentStateAPIRequest: UpdateContentStateAPIRequest): Observable<{
        [key: string]: any;
    }>;
}
