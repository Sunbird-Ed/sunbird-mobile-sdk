import {DbConstants} from '../../db';

export namespace PartnerEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'partners';
    export const COLUMN_NAME_PARTNER_ID = 'partnerID';
    export const COLUMN_NAME_KEY = 'publicKey';
    export const COLUMN_NAME_KEY_ID = 'publicKeyID';


    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + PartnerEntry.TABLE_NAME + ' (' +
            PartnerEntry._ID + ' INTEGER PRIMARY KEY,' +
            PartnerEntry.COLUMN_NAME_PARTNER_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' UNIQUE NOT NULL' + DbConstants.COMMA_SEP +
            PartnerEntry.COLUMN_NAME_KEY + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            PartnerEntry.COLUMN_NAME_KEY_ID + DbConstants.SPACE + DbConstants.INT_TYPE + ' NOT NULL' +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + PartnerEntry.TABLE_NAME;
    };

}
