import { DbService, Migration } from '..';
import { NetworkQueue } from '../../api/network-queue';
import { SdkConfig } from '../../sdk-config';
export declare class NetworkQueueMigration extends Migration {
    private sdkConfig;
    private networkQueue;
    constructor(sdkConfig: SdkConfig, networkQueue: NetworkQueue);
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
