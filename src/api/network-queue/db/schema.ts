import {DbConstants} from '../../../db';
import {NetworkQueueRequest} from '..';
import {Request as NetworkRequest} from '../..';

export namespace NetworkQueueEntry {

    export const TABLE_NAME = 'network_queue';
    export const _ID = '_id';
    export const COLUMN_NAME_TYPE = 'type';
    export const COLUMN_NAME_PRIORITY = 'priority';
    export const COLUMN_NAME_TIMESTAMP = 'timestamp';
    export const COLUMN_NAME_REQUEST = 'request';

    export interface SchemaMap {
        [_ID]?: number;
        [COLUMN_NAME_TYPE]: string;
        [COLUMN_NAME_PRIORITY]: number;
        [COLUMN_NAME_TIMESTAMP]: number;
        [COLUMN_NAME_REQUEST]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + NetworkQueueEntry.TABLE_NAME + ' (' +
            NetworkQueueEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            COLUMN_NAME_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_PRIORITY + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_TIMESTAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_REQUEST + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            ')';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + NetworkQueueEntry.TABLE_NAME;
    };

    export class Mapper {
        static entryToNetworkQueueRequest(entry: NetworkQueueEntry.SchemaMap): NetworkQueueRequest {
            return {
                id: entry[NetworkQueueEntry._ID],
                type: entry[NetworkQueueEntry.COLUMN_NAME_TYPE],
                priority: entry[NetworkQueueEntry.COLUMN_NAME_PRIORITY],
                ts: entry[NetworkQueueEntry.COLUMN_NAME_TIMESTAMP],
                networkRequest: NetworkRequest.JSONReviver(JSON.parse(entry[COLUMN_NAME_REQUEST]))
            };
        }

        static networkQueueRequestToEntry(networkQueueRequest: NetworkQueueRequest): NetworkQueueEntry.SchemaMap {
            return {
                [NetworkQueueEntry._ID]: networkQueueRequest.id,
                [NetworkQueueEntry.COLUMN_NAME_TYPE]: networkQueueRequest.type,
                [NetworkQueueEntry.COLUMN_NAME_PRIORITY]: networkQueueRequest.priority,
                [NetworkQueueEntry.COLUMN_NAME_TIMESTAMP]: networkQueueRequest.ts,
                [NetworkQueueEntry.COLUMN_NAME_REQUEST]: JSON.stringify(networkQueueRequest.networkRequest)
            };
        }
    }
}
