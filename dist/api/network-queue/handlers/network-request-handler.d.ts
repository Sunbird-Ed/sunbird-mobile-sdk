import { NetworkQueueRequest } from '..';
import { SdkConfig } from '../../../sdk-config';
export declare class NetworkRequestHandler {
    private config;
    constructor(config: SdkConfig);
    generateNetworkQueueRequest(type: any, data: any, messageId: any, eventsCount: any, isForceSynced: any): NetworkQueueRequest;
}
