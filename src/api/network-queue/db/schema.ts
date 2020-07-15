import {DbConstants} from '../../../db';
import {NetworkQueueRequest} from '..';

export namespace NetworkQueueEntry {

   export const TABLE_NAME = 'network_queue';
   export const _ID = '_id';
   export const COLUMN_NAME_MSG_ID = 'msg_id';
   export const COLUMN_NAME_PRIORITY = 'priority';
   export const COLUMN_NAME_TIMESTAMP = 'timestamp';
   export const COLUMN_NAME_DATA = 'data';
   export const COLUMN_NAME_REQUEST = 'request';
   export const COLUMN_NAME_NUMBER_OF_ITEM = 'item_count';
   export const COLUMN_NAME_CONFIG = 'config';
   export const COLUMN_NAME_TYPE = 'type';

   export interface SchemaMap {
     [COLUMN_NAME_MSG_ID]: string;
     [COLUMN_NAME_PRIORITY]: number;
     [COLUMN_NAME_TIMESTAMP]: number;
     [COLUMN_NAME_REQUEST]: string;
     [COLUMN_NAME_DATA]: string;
     [COLUMN_NAME_TYPE]: string;
     [COLUMN_NAME_NUMBER_OF_ITEM]: number;
     [COLUMN_NAME_CONFIG]: string;
   }

   export const getCreateEntry: (() => string) = () => {
     return 'CREATE TABLE IF NOT EXISTS ' + NetworkQueueEntry.TABLE_NAME + ' (' +
       NetworkQueueEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
       NetworkQueueEntry.COLUMN_NAME_MSG_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_PRIORITY + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_TIMESTAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_DATA + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_NUMBER_OF_ITEM + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_CONFIG + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
       COLUMN_NAME_REQUEST + DbConstants.SPACE + DbConstants.TEXT_TYPE +
       ')';
   };

   export const deleteTable: (() => string) = () => {
     return 'DROP TABLE IF EXISTS' + NetworkQueueEntry.TABLE_NAME;
   };

   export class Mapper {
     static networkQueueRequestToEntry(networkQueueRequest: NetworkQueueRequest): NetworkQueueEntry.SchemaMap {
       return {
         [NetworkQueueEntry.COLUMN_NAME_MSG_ID]: networkQueueRequest.msgId,
         [NetworkQueueEntry.COLUMN_NAME_PRIORITY]: networkQueueRequest.priority,
         [NetworkQueueEntry.COLUMN_NAME_TIMESTAMP]: networkQueueRequest.ts,
         [NetworkQueueEntry.COLUMN_NAME_DATA]: networkQueueRequest.data,
         [NetworkQueueEntry.COLUMN_NAME_NUMBER_OF_ITEM]: networkQueueRequest.itemCount,
         [NetworkQueueEntry.COLUMN_NAME_CONFIG]: networkQueueRequest.config,
         [NetworkQueueEntry.COLUMN_NAME_TYPE]: networkQueueRequest.type,
         [NetworkQueueEntry.COLUMN_NAME_REQUEST]: networkQueueRequest.networkRequest.toJSON()
       };
     }
   }
}
