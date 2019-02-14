import {SuggestedFramework} from './suggested-framework';
import {Framework} from './framework';

export interface Channel {
    identifier: string;
    code: string;
    consumerId: string;
    channel: string;
    description: string;
    frameworks?: Framework[];
    suggested_frameworks?: SuggestedFramework[];
    createdOn: string;
    versionKey: string;
    appId: string;
    name: string;
    lastUpdatedOn: string;
    defaultFramework: string;
    status: string;
}
