import { NetworkQueueRequest } from '..';
export declare namespace NetworkQueueEntry {
    const TABLE_NAME = "network_queue";
    const _ID = "_id";
    const COLUMN_NAME_MSG_ID = "msg_id";
    const COLUMN_NAME_PRIORITY = "priority";
    const COLUMN_NAME_TIMESTAMP = "timestamp";
    const COLUMN_NAME_DATA = "data";
    const COLUMN_NAME_REQUEST = "request";
    const COLUMN_NAME_NUMBER_OF_ITEM = "item_count";
    const COLUMN_NAME_CONFIG = "config";
    const COLUMN_NAME_TYPE = "type";
    interface SchemaMap {
        [COLUMN_NAME_MSG_ID]: string;
        [COLUMN_NAME_PRIORITY]: number;
        [COLUMN_NAME_TIMESTAMP]: number;
        [COLUMN_NAME_REQUEST]: string;
        [COLUMN_NAME_DATA]: string;
        [COLUMN_NAME_TYPE]: string;
        [COLUMN_NAME_NUMBER_OF_ITEM]: number;
        [COLUMN_NAME_CONFIG]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
    class Mapper {
        static networkQueueRequestToEntry(networkQueueRequest: NetworkQueueRequest): NetworkQueueEntry.SchemaMap;
    }
}
