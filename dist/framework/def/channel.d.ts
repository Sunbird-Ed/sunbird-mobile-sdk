import { Framework } from './framework';
export interface Channel {
    identifier: string;
    code: string;
    consumerId: string;
    channel: string;
    description: string;
    frameworks?: Framework[];
    createdOn: string;
    versionKey: string;
    appId: string;
    name: string;
    lastUpdatedOn: string;
    defaultFramework: string;
    status: string;
}
