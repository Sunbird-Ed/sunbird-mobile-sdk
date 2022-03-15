import {DbConstants} from '../../db';

export namespace CertificatePublicKeyEntry {
    export const _ID = '_id';
    export const TABLE_NAME = 'certificate_public_key';
    export const COLUMN_NAME_IDENTIFIER = 'identifier';
    export const COLUMN_NAME_PUBLIC_KEY = 'public_key';
    export const COLUMN_NAME_ALGORITHM = 'alg';
    export const COLUMN_NAME_OWNER = 'owner';
    export const COLUMN_NAME_EXPIRY_TIME = 'expiry_time';
    
    export interface SchemaMap {
        [COLUMN_NAME_IDENTIFIER]: string;
        [COLUMN_NAME_ALGORITHM]: string;
        [COLUMN_NAME_PUBLIC_KEY]: string;
        [COLUMN_NAME_OWNER]: string;
        [COLUMN_NAME_EXPIRY_TIME]: number;
    
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            _ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_IDENTIFIER + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_PUBLIC_KEY + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_ALGORITHM + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_OWNER + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_EXPIRY_TIME + DbConstants.SPACE + DbConstants.INT_TYPE +
            ' )';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;

    };
}
